
-- Add reply functionality to notifications
ALTER TABLE notifications ADD COLUMN parent_id uuid REFERENCES notifications(id);
ALTER TABLE notifications ADD COLUMN reply_to uuid REFERENCES notifications(id);
ALTER TABLE notifications ADD COLUMN is_reply boolean DEFAULT false;

-- Add automated cleanup function for old messages
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < (NOW() - INTERVAL '15 days');
END;
$$;

-- Schedule cleanup to run daily (requires pg_cron extension)
-- This will be added as a cron job later

-- Fix GST rate updating in inventory
UPDATE inventory SET gst_rate = 18.0 WHERE gst_rate IS NULL;

-- Add trigger to update inventory stock after franchise orders
CREATE OR REPLACE FUNCTION update_inventory_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- When order status changes to confirmed, reduce inventory stock
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Update inventory stock for each order item
    UPDATE inventory 
    SET stock = stock - oi.quantity,
        status = CASE 
          WHEN (stock - oi.quantity) <= 0 THEN 'Out of Stock'::inventory_status
          WHEN (stock - oi.quantity) <= min_order THEN 'Low Stock'::inventory_status
          ELSE 'In Stock'::inventory_status
        END
    FROM order_items oi
    WHERE inventory.id = oi.item_id 
    AND oi.order_id = NEW.id;
  END IF;
  
  -- If order is cancelled, restore inventory stock
  IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
    UPDATE inventory 
    SET stock = stock + oi.quantity,
        status = CASE 
          WHEN (stock + oi.quantity) <= 0 THEN 'Out of Stock'::inventory_status
          WHEN (stock + oi.quantity) <= min_order THEN 'Low Stock'::inventory_status
          ELSE 'In Stock'::inventory_status
        END
    FROM order_items oi
    WHERE inventory.id = oi.item_id 
    AND oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for inventory stock updates
DROP TRIGGER IF EXISTS update_inventory_stock_trigger ON franchise_orders;
CREATE TRIGGER update_inventory_stock_trigger
  AFTER UPDATE ON franchise_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock_on_order();

-- Fix loyalty points deduction
CREATE OR REPLACE FUNCTION deduct_loyalty_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- When loyalty transaction is created with type 'redeemed', update balance
  IF NEW.transaction_type = 'redeemed' THEN
    UPDATE loyalty_points
    SET 
      current_balance = current_balance - NEW.points,
      total_redeemed = total_redeemed + NEW.points,
      updated_at = now()
    WHERE franchise_member_id = NEW.franchise_member_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for loyalty points deduction
DROP TRIGGER IF EXISTS deduct_loyalty_points_trigger ON loyalty_transactions;
CREATE TRIGGER deduct_loyalty_points_trigger
  AFTER INSERT ON loyalty_transactions
  FOR EACH ROW
  EXECUTE FUNCTION deduct_loyalty_points();

-- Notify owner and admin on new orders
CREATE OR REPLACE FUNCTION notify_owner_admin_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create notification for owners and admins
  INSERT INTO public.notifications (type, title, message, user_id, data)
  SELECT 
    'new_franchise_order',
    'New Franchise Order',
    'New order #' || NEW.id::text || ' from ' || NEW.franchise_name || ' for ₹' || NEW.total_amount::text,
    p.id,
    jsonb_build_object(
      'order_id', NEW.id,
      'franchise_name', NEW.franchise_name,
      'total_amount', NEW.total_amount,
      'status', NEW.status
    )
  FROM public.profiles p
  WHERE p.role IN ('owner', 'admin');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new order notifications
DROP TRIGGER IF EXISTS notify_owner_admin_new_order_trigger ON franchise_orders;
CREATE TRIGGER notify_owner_admin_new_order_trigger
  AFTER INSERT ON franchise_orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_admin_new_order();
