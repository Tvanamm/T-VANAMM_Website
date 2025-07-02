
-- First, drop the existing incorrect policies on franchise_supply_summary
DROP POLICY IF EXISTS "Users can view franchise supply summary" ON franchise_supply_summary;
DROP POLICY IF EXISTS "Users can update franchise supply summary" ON franchise_supply_summary;

-- Create proper policies for franchise_supply_summary
-- Allow INSERT for the trigger function (SECURITY DEFINER will handle this)
CREATE POLICY "Allow insert for franchise supply summary"
ON franchise_supply_summary
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow UPDATE for the trigger function
CREATE POLICY "Allow update for franchise supply summary"  
ON franchise_supply_summary
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow SELECT for franchise members to view their own data
CREATE POLICY "Allow select for franchise supply summary"
ON franchise_supply_summary
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM franchise_members fm 
    WHERE fm.id = franchise_supply_summary.franchise_id 
    AND fm.user_id = auth.uid()
  )
  OR 
  get_current_user_role() IN ('admin', 'owner')
);

-- Now create the loyalty points system tables
CREATE TABLE public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_member_id UUID NOT NULL REFERENCES franchise_members(id) ON DELETE CASCADE,
  current_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(franchise_member_id)
);

CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_member_id UUID NOT NULL REFERENCES franchise_members(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'manual_add', 'gift_claim')),
  points INTEGER NOT NULL,
  order_id UUID REFERENCES franchise_orders(id),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE public.loyalty_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_member_id UUID NOT NULL REFERENCES franchise_members(id) ON DELETE CASCADE,
  gift_type TEXT NOT NULL CHECK (gift_type IN ('free_delivery', 'tea_cups')),
  points_used INTEGER NOT NULL DEFAULT 500,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'fulfilled')),
  order_id UUID REFERENCES franchise_orders(id)
);

-- Add RLS policies for loyalty tables
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_gifts ENABLE ROW LEVEL SECURITY;

-- Loyalty points policies
CREATE POLICY "Users can view their own loyalty points"
ON loyalty_points
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM franchise_members fm 
    WHERE fm.id = loyalty_points.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR get_current_user_role() IN ('admin', 'owner')
);

CREATE POLICY "Allow insert loyalty points"
ON loyalty_points
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update loyalty points"
ON loyalty_points
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Loyalty transactions policies
CREATE POLICY "Users can view their own loyalty transactions"
ON loyalty_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM franchise_members fm 
    WHERE fm.id = loyalty_transactions.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR get_current_user_role() IN ('admin', 'owner')
);

CREATE POLICY "Allow insert loyalty transactions"
ON loyalty_transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Loyalty gifts policies
CREATE POLICY "Users can view their own loyalty gifts"
ON loyalty_gifts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM franchise_members fm 
    WHERE fm.id = loyalty_gifts.franchise_member_id 
    AND fm.user_id = auth.uid()
  )
  OR get_current_user_role() IN ('admin', 'owner')
);

CREATE POLICY "Allow insert loyalty gifts"
ON loyalty_gifts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create trigger function to award loyalty points
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award 20 points for orders >= ₹5000 when status changes to delivered
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') 
     AND NEW.total_amount >= 5000 THEN
    
    -- Insert or update loyalty points
    INSERT INTO public.loyalty_points (franchise_member_id, current_balance, total_earned)
    VALUES (NEW.franchise_member_id, 20, 20)
    ON CONFLICT (franchise_member_id)
    DO UPDATE SET
      current_balance = loyalty_points.current_balance + 20,
      total_earned = loyalty_points.total_earned + 20,
      updated_at = now();
    
    -- Record the transaction
    INSERT INTO public.loyalty_transactions (
      franchise_member_id, 
      transaction_type, 
      points, 
      order_id, 
      description
    )
    VALUES (
      NEW.franchise_member_id,
      'earned',
      20,
      NEW.id,
      'Points earned for order above ₹5000'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for loyalty points
DROP TRIGGER IF EXISTS award_loyalty_points_trigger ON franchise_orders;
CREATE TRIGGER award_loyalty_points_trigger
  AFTER UPDATE ON franchise_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_loyalty_points();

-- Add updated_at triggers for loyalty tables
CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for loyalty tables
ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_points;
ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_transactions;  
ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_gifts;

-- Set replica identity for real-time updates
ALTER TABLE loyalty_points REPLICA IDENTITY FULL;
ALTER TABLE loyalty_transactions REPLICA IDENTITY FULL;
ALTER TABLE loyalty_gifts REPLICA IDENTITY FULL;
