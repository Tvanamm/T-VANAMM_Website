-- Add unique constraint to prevent duplicate packing checklist items
ALTER TABLE order_packing_checklist 
ADD CONSTRAINT unique_order_item_packing 
UNIQUE (order_id, item_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_order_packing_checklist_order_id 
ON order_packing_checklist(order_id);

-- Add index for packed status queries
CREATE INDEX IF NOT EXISTS idx_order_packing_checklist_packed 
ON order_packing_checklist(order_id, packed);