
-- COMPREHENSIVE DATABASE FIX - Phase 1: Fixed version with proper policy cleanup

-- 1. Create the missing assign_role_and_create_member function
CREATE OR REPLACE FUNCTION public.assign_role_and_create_member(
  target_user_id uuid,
  new_role text,
  franchise_location text DEFAULT 'Not specified',
  member_name text DEFAULT NULL,
  member_email text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_profile RECORD;
BEGIN
  -- Check if current user is owner
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner') THEN
    RAISE EXCEPTION 'Access denied. Only owners can assign roles.';
  END IF;
  
  -- Get target user profile
  SELECT * INTO user_profile FROM profiles WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;
  
  -- Update user role in profiles table
  UPDATE profiles 
  SET role = new_role::user_role, updated_at = now()
  WHERE id = target_user_id;
  
  -- If assigning franchise role, create franchise member record
  IF new_role = 'franchise' THEN
    INSERT INTO franchise_members (
      user_id,
      name,
      email,
      franchise_location,
      position,
      status
    )
    VALUES (
      target_user_id,
      COALESCE(member_name, user_profile.name),
      COALESCE(member_email, user_profile.email),
      franchise_location,
      'Franchise Owner',
      'active'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      name = COALESCE(member_name, user_profile.name),
      email = COALESCE(member_email, user_profile.email),
      franchise_location = franchise_location,
      updated_at = now();
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to assign role: %', SQLERRM;
END;
$function$;

-- 2. Create the missing create_franchise_order function
CREATE OR REPLACE FUNCTION public.create_franchise_order(
  p_franchise_member_id uuid,
  p_franchise_name text,
  p_tvanamm_id text,
  p_shipping_address text,
  p_total_amount numeric,
  p_order_items jsonb,
  p_delivery_fee numeric DEFAULT 0,
  p_loyalty_points_used integer DEFAULT 0,
  p_loyalty_gift_claimed text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_order_id uuid;
  item jsonb;
BEGIN
  -- Insert the main order
  INSERT INTO franchise_orders (
    franchise_member_id,
    franchise_name,
    tvanamm_id,
    shipping_address,
    total_amount,
    delivery_fee_override,
    loyalty_points_used,
    loyalty_gift_claimed,
    status
  )
  VALUES (
    p_franchise_member_id,
    p_franchise_name,
    p_tvanamm_id,
    p_shipping_address,
    p_total_amount,
    p_delivery_fee,
    p_loyalty_points_used,
    p_loyalty_gift_claimed,
    'pending'
  )
  RETURNING id INTO new_order_id;

  -- Insert order items
  FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    INSERT INTO order_items (
      order_id,
      item_id,
      item_name,
      quantity,
      unit_price,
      total_price
    )
    VALUES (
      new_order_id,
      (item->>'item_id')::integer,
      item->>'item_name',
      (item->>'quantity')::integer,
      (item->>'unit_price')::numeric,
      (item->>'total_price')::numeric
    );
  END LOOP;

  RETURN new_order_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create order: %', SQLERRM;
END;
$function$;

-- 3. Fix loyalty constraint to match application code
ALTER TABLE loyalty_transactions DROP CONSTRAINT IF EXISTS loyalty_transactions_transaction_type_check;
ALTER TABLE loyalty_transactions ADD CONSTRAINT loyalty_transactions_transaction_type_check 
CHECK (transaction_type IN ('earned', 'redeemed', 'manual_addition', 'expired'));

-- 4. Fix export_forms_data function column ambiguity
DROP FUNCTION IF EXISTS public.export_forms_data(date, date, text);

CREATE OR REPLACE FUNCTION public.export_forms_data(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  form_type_filter text DEFAULT NULL
)
RETURNS TABLE(
  submission_id uuid,
  submission_type text,
  submitter_name text,
  submitter_email text,
  submitter_phone text,
  submission_message text,
  submission_status text,
  submission_franchise_location text,
  submission_investment_amount numeric,
  submission_catalog_requested boolean,
  submission_created_at timestamp with time zone,
  contact_notes text,
  contacted_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    fs.id as submission_id,
    fs.type as submission_type,
    fs.name as submitter_name,
    fs.email as submitter_email,
    fs.phone as submitter_phone,
    fs.message as submission_message,
    fs.status as submission_status,
    fs.franchise_location as submission_franchise_location,
    fs.investment_amount as submission_investment_amount,
    fs.catalog_requested as submission_catalog_requested,
    fs.created_at as submission_created_at,
    fs.contact_notes,
    fs.contacted_at
  FROM public.form_submissions fs
  WHERE fs.created_at::date BETWEEN start_date AND end_date
    AND (form_type_filter IS NULL OR fs.type = form_type_filter)
    AND fs.status != 'archived'
  ORDER BY fs.created_at DESC;
END;
$function$;

-- 5. Drop ALL existing policies on the affected tables first
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    -- Drop all policies on franchise_orders
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'franchise_orders'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.franchise_orders';
    END LOOP;
    
    -- Drop all policies on franchise_members
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'franchise_members'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.franchise_members';
    END LOOP;
    
    -- Drop all policies on loyalty_points
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'loyalty_points'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.loyalty_points';
    END LOOP;
    
    -- Drop all policies on loyalty_transactions
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'loyalty_transactions'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.loyalty_transactions';
    END LOOP;
END $$;

-- 6. Enable RLS on all tables
ALTER TABLE franchise_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- 7. Create clean RLS policies for franchise_orders
CREATE POLICY "franchise_orders_select_policy"
  ON franchise_orders FOR SELECT
  USING (
    franchise_member_id IN (
      SELECT id FROM franchise_members WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "franchise_orders_insert_policy"
  ON franchise_orders FOR INSERT
  WITH CHECK (
    franchise_member_id IN (
      SELECT id FROM franchise_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "franchise_orders_update_policy"
  ON franchise_orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- 8. Create clean RLS policies for franchise_members
CREATE POLICY "franchise_members_select_policy"
  ON franchise_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "franchise_members_all_policy"
  ON franchise_members FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- 9. Create clean RLS policies for loyalty_points
CREATE POLICY "loyalty_points_select_policy"
  ON loyalty_points FOR SELECT
  USING (
    franchise_member_id IN (
      SELECT id FROM franchise_members WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "loyalty_points_all_policy"
  ON loyalty_points FOR ALL
  USING (true);

-- 10. Create clean RLS policies for loyalty_transactions
CREATE POLICY "loyalty_transactions_select_policy"
  ON loyalty_transactions FOR SELECT
  USING (
    franchise_member_id IN (
      SELECT id FROM franchise_members WHERE user_id = auth.uid()
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "loyalty_transactions_all_policy"
  ON loyalty_transactions FOR ALL
  USING (true);
