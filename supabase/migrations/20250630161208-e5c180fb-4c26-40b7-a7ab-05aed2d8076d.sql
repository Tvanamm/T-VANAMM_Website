
-- Add packing and shipping workflow columns to franchise_orders
ALTER TABLE public.franchise_orders 
ADD COLUMN IF NOT EXISTS shipping_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS packed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shipped_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE;

-- Create export logs table
CREATE TABLE IF NOT EXISTS public.export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  export_type TEXT NOT NULL CHECK (export_type IN ('forms', 'orders')),
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel')),
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB DEFAULT '{}',
  record_count INTEGER DEFAULT 0,
  file_size INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on export_logs
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for export_logs
CREATE POLICY "Users can view own export logs" ON public.export_logs
FOR ALL USING (auth.uid() = user_id);

-- Create cleanup logs table
CREATE TABLE IF NOT EXISTS public.cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleanup_type TEXT NOT NULL,
  records_deleted INTEGER DEFAULT 0,
  cleanup_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  details JSONB DEFAULT '{}'
);

-- Fix the loyalty points manual addition function
CREATE OR REPLACE FUNCTION public.add_loyalty_points_manual(
  target_franchise_member_id UUID,
  points_to_add INTEGER,
  description_text TEXT DEFAULT 'Manually added by admin'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is owner or admin
  SELECT role INTO current_user_role FROM profiles WHERE id = auth.uid();
  
  IF current_user_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only owners and admins can manually add loyalty points.';
  END IF;
  
  -- Add points to loyalty_points table
  INSERT INTO public.loyalty_points (franchise_member_id, current_balance, total_earned)
  VALUES (target_franchise_member_id, points_to_add, points_to_add)
  ON CONFLICT (franchise_member_id)
  DO UPDATE SET
    current_balance = loyalty_points.current_balance + points_to_add,
    total_earned = loyalty_points.total_earned + points_to_add,
    updated_at = now();
  
  -- Record the transaction
  INSERT INTO public.loyalty_transactions (
    franchise_member_id,
    transaction_type,
    points,
    description
  )
  VALUES (
    target_franchise_member_id,
    'manual_addition',
    points_to_add,
    description_text
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to add loyalty points: %', SQLERRM;
END;
$$;

-- Create function for automated cleanup
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_notifications INTEGER := 0;
  deleted_forms INTEGER := 0;
  deleted_orders INTEGER := 0;
BEGIN
  -- Delete old notifications (30+ days)
  DELETE FROM public.notifications 
  WHERE created_at < (NOW() - INTERVAL '30 days')
  AND read = true;
  
  GET DIAGNOSTICS deleted_notifications = ROW_COUNT;
  
  -- Archive old form submissions (keep for reference but mark as archived)
  UPDATE public.form_submissions 
  SET status = 'archived'
  WHERE created_at < (NOW() - INTERVAL '30 days')
  AND status IN ('pending', 'contacted');
  
  GET DIAGNOSTICS deleted_forms = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO public.cleanup_logs (cleanup_type, records_deleted, details)
  VALUES (
    'automated_cleanup',
    deleted_notifications + deleted_forms,
    jsonb_build_object(
      'notifications_deleted', deleted_notifications,
      'forms_archived', deleted_forms,
      'cleanup_date', now()
    )
  );
  
END;
$$;

-- Create function for exporting forms data
CREATE OR REPLACE FUNCTION public.export_forms_data(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  form_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  status TEXT,
  franchise_location TEXT,
  investment_amount NUMERIC,
  catalog_requested BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  contact_notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is owner
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner') THEN
    RAISE EXCEPTION 'Access denied. Only owners can export forms data.';
  END IF;
  
  -- Set default date range if not provided (last 30 days)
  IF start_date IS NULL THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;
  
  IF end_date IS NULL THEN
    end_date := CURRENT_DATE;
  END IF;
  
  -- Ensure date range doesn't exceed 30 days
  IF end_date - start_date > 30 THEN
    RAISE EXCEPTION 'Date range cannot exceed 30 days';
  END IF;
  
  RETURN QUERY
  SELECT 
    fs.id,
    fs.type,
    fs.name,
    fs.email,
    fs.phone,
    fs.message,
    fs.status,
    fs.franchise_location,
    fs.investment_amount,
    fs.catalog_requested,
    fs.created_at,
    fs.contact_notes,
    fs.contacted_at
  FROM public.form_submissions fs
  WHERE fs.created_at::date BETWEEN start_date AND end_date
    AND (form_type_filter IS NULL OR fs.type = form_type_filter)
    AND fs.status != 'archived'
  ORDER BY fs.created_at DESC;
END;
$$;

-- Create function for exporting orders data
CREATE OR REPLACE FUNCTION public.export_orders_data(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  franchise_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  franchise_name TEXT,
  tvanamm_id TEXT,
  total_amount NUMERIC,
  delivery_fee NUMERIC,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  tracking_number TEXT,
  shipping_address TEXT,
  shipping_details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if current user is owner or admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')) THEN
    RAISE EXCEPTION 'Access denied. Only owners and admins can export orders data.';
  END IF;
  
  -- Set default date range if not provided (last 30 days)
  IF start_date IS NULL THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;
  
  IF end_date IS NULL THEN
    end_date := CURRENT_DATE;
  END IF;
  
  -- Ensure date range doesn't exceed 30 days
  IF end_date - start_date > 30 THEN
    RAISE EXCEPTION 'Date range cannot exceed 30 days';
  END IF;
  
  RETURN QUERY
  SELECT 
    fo.id as order_id,
    fo.franchise_name,
    fo.tvanamm_id,
    fo.total_amount,
    fo.delivery_fee_override as delivery_fee,
    fo.status::TEXT,
    fo.created_at,
    fo.shipped_at,
    fo.tracking_number,
    fo.shipping_address,
    fo.shipping_details
  FROM public.franchise_orders fo
  WHERE fo.created_at::date BETWEEN start_date AND end_date
    AND (status_filter IS NULL OR fo.status::TEXT = status_filter)
    AND (franchise_filter IS NULL OR fo.franchise_name ILIKE '%' || franchise_filter || '%')
  ORDER BY fo.created_at DESC;
END;
$$;
