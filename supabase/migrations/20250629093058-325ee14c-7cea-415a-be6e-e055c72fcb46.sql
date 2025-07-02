
-- Create franchise_delivery_settings table to store per-franchise delivery configurations
CREATE TABLE IF NOT EXISTS public.franchise_delivery_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  franchise_location text NOT NULL UNIQUE,
  delivery_fee numeric NOT NULL DEFAULT 50,
  free_delivery_threshold numeric DEFAULT 2000,
  express_delivery_fee numeric DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for franchise delivery settings
ALTER TABLE public.franchise_delivery_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for franchise delivery settings
CREATE POLICY "Anyone can view franchise delivery settings" 
  ON public.franchise_delivery_settings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only owners and admins can modify franchise delivery settings" 
  ON public.franchise_delivery_settings 
  FOR ALL 
  USING (get_current_user_role() IN ('admin', 'owner'));

-- Add trigger to update updated_at column
CREATE OR REPLACE TRIGGER update_franchise_delivery_settings_updated_at
  BEFORE UPDATE ON public.franchise_delivery_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync transportation fees from franchise_members to delivery settings
CREATE OR REPLACE FUNCTION sync_franchise_delivery_fee()
RETURNS TRIGGER AS $$
BEGIN
  -- When transportation_fee is updated in franchise_members, sync it to delivery_settings
  IF OLD.transportation_fee IS DISTINCT FROM NEW.transportation_fee THEN
    INSERT INTO public.franchise_delivery_settings (
      franchise_location, 
      delivery_fee, 
      free_delivery_threshold, 
      express_delivery_fee
    )
    VALUES (
      NEW.franchise_location,
      COALESCE(NEW.transportation_fee, 50),
      2000,
      100
    )
    ON CONFLICT (franchise_location)
    DO UPDATE SET
      delivery_fee = COALESCE(NEW.transportation_fee, 50),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync transportation fees
CREATE OR REPLACE TRIGGER sync_franchise_delivery_fee_trigger
  AFTER INSERT OR UPDATE ON public.franchise_members
  FOR EACH ROW
  EXECUTE FUNCTION sync_franchise_delivery_fee();
