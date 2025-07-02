
-- Add missing columns to franchise_orders table
ALTER TABLE franchise_orders 
ADD COLUMN IF NOT EXISTS tvanamm_id TEXT,
ADD COLUMN IF NOT EXISTS detailed_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS delivery_fee_override NUMERIC,
ADD COLUMN IF NOT EXISTS loyalty_points_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS loyalty_gift_claimed TEXT,
ADD COLUMN IF NOT EXISTS packing_status TEXT DEFAULT 'not_started';

-- Create order_packing_items table for detailed packing checklist
CREATE TABLE IF NOT EXISTS order_packing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES franchise_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  packed_quantity INTEGER DEFAULT 0,
  is_packed BOOLEAN DEFAULT FALSE,
  packed_at TIMESTAMP WITH TIME ZONE,
  packed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for order_packing_items updated_at
CREATE OR REPLACE TRIGGER update_order_packing_items_updated_at
  BEFORE UPDATE ON order_packing_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to manually add loyalty points (for owners/admins)
CREATE OR REPLACE FUNCTION public.add_loyalty_points_manual(
  target_franchise_member_id UUID,
  points_to_add INTEGER,
  description_text TEXT DEFAULT 'Manually added by admin'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    RETURN FALSE;
END;
$$;

-- Update order status enum to include all required statuses
DO $$ 
BEGIN
  -- Check if we need to update the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'paid' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
  ) THEN
    -- Add missing enum values
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'paid';
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'packing';
  END IF;
END $$;

-- Enable RLS on new table
ALTER TABLE order_packing_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_packing_items
CREATE POLICY "Admin and owner can manage packing items" ON order_packing_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Franchise members can view their packing items" ON order_packing_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM franchise_orders fo
      JOIN franchise_members fm ON fo.franchise_member_id = fm.id
      WHERE fo.id = order_packing_items.order_id
      AND fm.user_id = auth.uid()
    )
  );

-- Enhanced loyalty order completion handler
CREATE OR REPLACE FUNCTION handle_enhanced_loyalty_order_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award loyalty points when order is delivered (20 points for orders >= ₹5000)
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') 
     AND NEW.total_amount >= 5000 THEN
    
    INSERT INTO public.loyalty_points (franchise_member_id, current_balance, total_earned)
    VALUES (NEW.franchise_member_id, 20, 20)
    ON CONFLICT (franchise_member_id)
    DO UPDATE SET
      current_balance = loyalty_points.current_balance + 20,
      total_earned = loyalty_points.total_earned + 20,
      updated_at = now();
    
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
  
  -- Process loyalty points redemption when order is confirmed
  IF NEW.status = 'confirmed' AND NEW.loyalty_points_used > 0 THEN
    UPDATE public.loyalty_points
    SET 
      current_balance = current_balance - NEW.loyalty_points_used,
      total_redeemed = total_redeemed + NEW.loyalty_points_used,
      updated_at = now()
    WHERE franchise_member_id = NEW.franchise_member_id;
    
    INSERT INTO public.loyalty_transactions (
      franchise_member_id,
      transaction_type,
      points,
      order_id,
      description
    )
    VALUES (
      NEW.franchise_member_id,
      'redeemed',
      NEW.loyalty_points_used,
      NEW.id,
      CASE 
        WHEN NEW.loyalty_gift_claimed = 'free_delivery' THEN 'Free delivery gift claimed'
        WHEN NEW.loyalty_gift_claimed = 'tea_cups' THEN '30 tea cups gift claimed'
        ELSE 'Points redeemed for discount'
      END
    );
    
    -- Record gift claim if applicable
    IF NEW.loyalty_gift_claimed IS NOT NULL THEN
      INSERT INTO public.loyalty_gifts (
        franchise_member_id,
        gift_type,
        points_used,
        order_id,
        status
      )
      VALUES (
        NEW.franchise_member_id,
        NEW.loyalty_gift_claimed,
        500,
        NEW.id,
        'claimed'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS award_loyalty_points ON franchise_orders;
DROP TRIGGER IF EXISTS handle_loyalty_order_completion_trigger ON franchise_orders;
CREATE TRIGGER handle_enhanced_loyalty_order_completion_trigger
  AFTER UPDATE ON franchise_orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_enhanced_loyalty_order_completion();
