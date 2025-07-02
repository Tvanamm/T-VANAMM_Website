
-- Create delivery settings table for dynamic delivery fee configuration
CREATE TABLE IF NOT EXISTS public.delivery_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_delivery_fee numeric NOT NULL DEFAULT 50,
  free_delivery_threshold numeric DEFAULT 2000,
  express_delivery_fee numeric DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default delivery settings
INSERT INTO public.delivery_settings (base_delivery_fee, free_delivery_threshold, express_delivery_fee) 
VALUES (50, 2000, 100) 
ON CONFLICT DO NOTHING;

-- Create payment transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created',
  payment_method text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for delivery settings (only admins can modify)
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view delivery settings" 
  ON public.delivery_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify delivery settings" 
  ON public.delivery_settings 
  FOR ALL 
  USING (get_current_user_role() IN ('admin', 'owner'));

-- Add RLS policies for payment transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payment transactions" 
  ON public.payment_transactions 
  FOR SELECT 
  USING (
    order_id IN (
      SELECT fo.id 
      FROM franchise_orders fo 
      JOIN franchise_members fm ON fo.franchise_member_id = fm.id 
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage payment transactions" 
  ON public.payment_transactions 
  FOR ALL 
  USING (get_current_user_role() IN ('admin', 'owner', 'system'));

-- Add trigger to update updated_at for delivery_settings
CREATE OR REPLACE TRIGGER update_delivery_settings_updated_at
  BEFORE UPDATE ON public.delivery_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to update updated_at for payment_transactions
CREATE OR REPLACE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate delivery fee based on order amount
CREATE OR REPLACE FUNCTION public.calculate_delivery_fee(order_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  delivery_fee numeric;
  free_threshold numeric;
BEGIN
  SELECT 
    base_delivery_fee,
    free_delivery_threshold
  INTO delivery_fee, free_threshold
  FROM public.delivery_settings
  WHERE active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no settings found, use default
  IF delivery_fee IS NULL THEN
    delivery_fee := 50;
    free_threshold := 2000;
  END IF;
  
  -- Free delivery above threshold
  IF order_amount >= free_threshold THEN
    RETURN 0;
  END IF;
  
  RETURN delivery_fee;
END;
$$;
