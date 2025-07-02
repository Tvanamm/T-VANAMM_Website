
-- Fix the RLS policies for franchise_supply_summary table
DROP POLICY IF EXISTS "Allow insert for franchise supply summary" ON franchise_supply_summary;
DROP POLICY IF EXISTS "Allow update for franchise supply summary" ON franchise_supply_summary;
DROP POLICY IF EXISTS "Allow select for franchise supply summary" ON franchise_supply_summary;

-- Create proper RLS policies for franchise_supply_summary
CREATE POLICY "Allow all operations for franchise supply summary"
ON franchise_supply_summary
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure loyalty points are properly initialized for existing franchise members
INSERT INTO public.loyalty_points (franchise_member_id, current_balance, total_earned, total_redeemed)
SELECT 
  fm.id,
  COALESCE(
    (SELECT SUM(20) FROM franchise_orders fo 
     WHERE fo.franchise_member_id = fm.id 
     AND fo.status = 'delivered' 
     AND fo.total_amount >= 5000), 0
  ) as current_balance,
  COALESCE(
    (SELECT SUM(20) FROM franchise_orders fo 
     WHERE fo.franchise_member_id = fm.id 
     AND fo.status = 'delivered' 
     AND fo.total_amount >= 5000), 0
  ) as total_earned,
  0 as total_redeemed
FROM franchise_members fm
WHERE NOT EXISTS (
  SELECT 1 FROM loyalty_points lp 
  WHERE lp.franchise_member_id = fm.id
);

-- Enable realtime for all necessary tables
ALTER PUBLICATION supabase_realtime ADD TABLE franchise_supply_summary;
ALTER TABLE franchise_supply_summary REPLICA IDENTITY FULL;
