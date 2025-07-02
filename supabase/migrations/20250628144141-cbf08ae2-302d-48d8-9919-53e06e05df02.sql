
-- First, let's check and fix the RLS policies for franchise_orders table
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Franchise members can create orders" ON public.franchise_orders;
DROP POLICY IF EXISTS "Users can view related orders" ON public.franchise_orders;
DROP POLICY IF EXISTS "Users can update related orders" ON public.franchise_orders;
DROP POLICY IF EXISTS "Franchises can create orders" ON public.franchise_orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.franchise_orders;

-- Enable RLS on the table
ALTER TABLE public.franchise_orders ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies that work with franchise_member_id
CREATE POLICY "Allow franchise members to insert orders"
ON public.franchise_orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.franchise_members fm
    WHERE fm.id = franchise_orders.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
);

CREATE POLICY "Allow franchise members to select orders"
ON public.franchise_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_members fm
    WHERE fm.id = franchise_orders.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Allow franchise members to update orders"
ON public.franchise_orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_members fm
    WHERE fm.id = franchise_orders.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

-- Also ensure order_items table has proper RLS
DROP POLICY IF EXISTS "Allow order items access" ON public.order_items;

CREATE POLICY "Allow order items access"
ON public.order_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_orders fo
    JOIN public.franchise_members fm ON fm.id = fo.franchise_member_id
    WHERE fo.id = order_items.order_id 
    AND fm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
