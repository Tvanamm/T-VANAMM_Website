
-- Remove transportation_fee column from franchise_members table
ALTER TABLE public.franchise_members DROP COLUMN IF EXISTS transportation_fee;

-- Update franchise_orders table to ensure proper handling of delivery fees
ALTER TABLE public.franchise_orders 
ALTER COLUMN delivery_fee_override TYPE numeric;

-- Add proper indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_franchise_orders_member_id ON public.franchise_orders(franchise_member_id);
CREATE INDEX IF NOT EXISTS idx_franchise_orders_status ON public.franchise_orders(status);
CREATE INDEX IF NOT EXISTS idx_franchise_orders_created_at ON public.franchise_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_franchise_members_user_id ON public.franchise_members(user_id);
CREATE INDEX IF NOT EXISTS idx_franchise_members_status ON public.franchise_members(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Update RLS policies for better user isolation
DROP POLICY IF EXISTS "franchise_orders_select_policy" ON public.franchise_orders;
CREATE POLICY "franchise_orders_select_policy" ON public.franchise_orders
FOR SELECT USING (
  (franchise_member_id IN (
    SELECT id FROM public.franchise_members 
    WHERE user_id = auth.uid()
  )) OR 
  (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ))
);

-- Update notifications policy for better user isolation
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT USING (
  user_id = auth.uid() OR 
  user_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Add dashboard_access_enabled column for franchise members
ALTER TABLE public.franchise_members 
ADD COLUMN IF NOT EXISTS dashboard_access_enabled boolean DEFAULT true;

-- Update the create_franchise_order function to handle proper delivery fee validation
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
AS $$
DECLARE
  new_order_id uuid;
  item jsonb;
BEGIN
  -- Validate delivery fee is not negative
  IF p_delivery_fee < 0 THEN
    p_delivery_fee := 0;
  END IF;

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
    CASE WHEN p_delivery_fee > 0 THEN p_delivery_fee ELSE NULL END,
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
$$;
