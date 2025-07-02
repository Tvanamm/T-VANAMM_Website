
-- Fix franchise_orders table to properly link with franchise_members
-- Add missing columns and fix relationships
ALTER TABLE public.franchise_orders 
ADD COLUMN IF NOT EXISTS franchise_member_id uuid REFERENCES public.franchise_members(id);

-- Update form_submissions table to better track different form types
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS form_type text DEFAULT 'contact'::text,
ADD COLUMN IF NOT EXISTS catalog_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS franchise_inquiry_details jsonb DEFAULT NULL;

-- Create a trigger to update franchise revenue when orders are confirmed
CREATE OR REPLACE FUNCTION public.update_franchise_revenue_realtime()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update franchise member revenue when order status changes to confirmed/completed/delivered
  IF NEW.status IN ('confirmed', 'completed', 'delivered') AND 
     (OLD.status IS NULL OR OLD.status NOT IN ('confirmed', 'completed', 'delivered')) THEN
    
    UPDATE public.franchise_members 
    SET revenue_generated = revenue_generated + NEW.total_amount
    WHERE id = NEW.franchise_member_id;
  END IF;
  
  -- If order is cancelled or status changed from confirmed to pending, subtract revenue
  IF OLD.status IN ('confirmed', 'completed', 'delivered') AND 
     NEW.status NOT IN ('confirmed', 'completed', 'delivered') THEN
    
    UPDATE public.franchise_members 
    SET revenue_generated = GREATEST(0, revenue_generated - OLD.total_amount)
    WHERE id = OLD.franchise_member_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for real-time revenue updates
DROP TRIGGER IF EXISTS update_franchise_revenue_trigger ON public.franchise_orders;
CREATE TRIGGER update_franchise_revenue_trigger
  AFTER UPDATE ON public.franchise_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_franchise_revenue_realtime();

-- Enable realtime for form_submissions table
ALTER TABLE public.form_submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.form_submissions;

-- Set replica identity for franchise_orders (skip adding to publication since it's already there)
ALTER TABLE public.franchise_orders REPLICA IDENTITY FULL;

-- Create function to notify owner of new form submissions
CREATE OR REPLACE FUNCTION public.notify_owner_form_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create notification for owners about new form submission
  INSERT INTO public.notifications (
    type, 
    title, 
    message, 
    user_id, 
    data
  )
  SELECT 
    'new_form_submission',
    CASE 
      WHEN NEW.type = 'franchise' THEN 'New Franchise Enquiry'
      WHEN NEW.catalog_requested = true THEN 'New Catalog Request'
      ELSE 'New Contact Form Submission'
    END,
    'A new ' || NEW.type || ' form has been submitted by ' || COALESCE(NEW.name, NEW.email),
    p.id,
    jsonb_build_object(
      'form_id', NEW.id,
      'form_type', NEW.type,
      'submitter_name', NEW.name,
      'submitter_email', NEW.email,
      'submitter_phone', NEW.phone,
      'message', NEW.message,
      'catalog_requested', NEW.catalog_requested,
      'franchise_location', NEW.franchise_location,
      'investment_amount', NEW.investment_amount,
      'submitted_at', NEW.created_at
    )
  FROM public.profiles p
  WHERE p.role = 'owner';
  
  RETURN NEW;
END;
$$;

-- Create trigger for form submission notifications
DROP TRIGGER IF EXISTS notify_form_submission_trigger ON public.form_submissions;
CREATE TRIGGER notify_form_submission_trigger
  AFTER INSERT ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_owner_form_submission();
