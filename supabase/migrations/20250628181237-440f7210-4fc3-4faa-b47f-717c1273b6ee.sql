
-- Fix RLS policies for order_packing_checklist table
ALTER TABLE public.order_packing_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow franchise members to access packing checklist for their orders"
ON public.order_packing_checklist
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_orders fo
    JOIN public.franchise_members fm ON fm.id = fo.franchise_member_id
    WHERE fo.id = order_packing_checklist.order_id 
    AND fm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

-- Ensure loyalty_points table has proper RLS for admin access
DROP POLICY IF EXISTS "Allow franchise members to access loyalty points" ON public.loyalty_points;

CREATE POLICY "Allow franchise members and admins to access loyalty points"
ON public.loyalty_points
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_members fm
    WHERE fm.id = loyalty_points.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

-- Ensure loyalty_transactions table has proper RLS
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow franchise members and admins to access loyalty transactions"
ON public.loyalty_transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_members fm
    WHERE fm.id = loyalty_transactions.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

-- Ensure loyalty_gifts table has proper RLS
ALTER TABLE public.loyalty_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow franchise members and admins to access loyalty gifts"
ON public.loyalty_gifts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.franchise_members fm
    WHERE fm.id = loyalty_gifts.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'owner')
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchise_members_user_id ON public.franchise_members(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_franchise_member_id ON public.loyalty_points(franchise_member_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_franchise_member_id ON public.loyalty_transactions(franchise_member_id);
CREATE INDEX IF NOT EXISTS idx_franchise_orders_franchise_member_id ON public.franchise_orders(franchise_member_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
