
-- First, let's add the missing columns to franchise_members table
ALTER TABLE public.franchise_members 
ADD COLUMN IF NOT EXISTS tvanamm_id text,
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS transportation_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_generated numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion_percentage numeric DEFAULT 0;

-- Update the status column to use proper values
UPDATE public.franchise_members 
SET status = 'verified' 
WHERE status = 'active';

-- Add franchise_member_id column to franchise_orders table
ALTER TABLE public.franchise_orders 
ADD COLUMN IF NOT EXISTS franchise_member_id uuid REFERENCES public.franchise_members(id);

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(member_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  completion_percentage numeric := 0;
  total_fields numeric := 10;
  filled_fields numeric := 0;
BEGIN
  SELECT 
    CASE WHEN name IS NOT NULL AND name != '' THEN 1 ELSE 0 END +
    CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END +
    CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END +
    CASE WHEN tvanamm_id IS NOT NULL AND tvanamm_id != '' THEN 1 ELSE 0 END +
    CASE WHEN pincode IS NOT NULL AND pincode != '' THEN 1 ELSE 0 END +
    CASE WHEN state IS NOT NULL AND state != '' THEN 1 ELSE 0 END +
    CASE WHEN area IS NOT NULL AND area != '' THEN 1 ELSE 0 END +
    CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END +
    CASE WHEN franchise_location IS NOT NULL AND franchise_location != '' THEN 1 ELSE 0 END +
    CASE WHEN position IS NOT NULL AND position != '' THEN 1 ELSE 0 END
  INTO filled_fields
  FROM public.franchise_members
  WHERE id = member_id;

  completion_percentage := (filled_fields / total_fields) * 100;
  
  RETURN completion_percentage;
END;
$$;

-- Create trigger to update profile completion percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.profile_completion_percentage := public.calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS update_franchise_member_completion ON public.franchise_members;
CREATE TRIGGER update_franchise_member_completion
  BEFORE INSERT OR UPDATE ON public.franchise_members
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_completion();

-- Update existing records
UPDATE public.franchise_members 
SET profile_completion_percentage = public.calculate_profile_completion(id);

-- Create function to update franchise revenue
CREATE OR REPLACE FUNCTION public.update_franchise_revenue()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update franchise member revenue when order is confirmed/completed
  IF NEW.status IN ('confirmed', 'completed', 'delivered') AND 
     OLD.status NOT IN ('confirmed', 'completed', 'delivered') THEN
    
    UPDATE public.franchise_members 
    SET revenue_generated = revenue_generated + NEW.total_amount
    WHERE id = NEW.franchise_member_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for revenue updates
DROP TRIGGER IF EXISTS update_franchise_revenue_trigger ON public.franchise_orders;
CREATE TRIGGER update_franchise_revenue_trigger
  AFTER UPDATE ON public.franchise_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_franchise_revenue();

-- Enable realtime for all relevant tables
ALTER TABLE public.franchise_members REPLICA IDENTITY FULL;
ALTER TABLE public.franchise_orders REPLICA IDENTITY FULL;
ALTER TABLE public.website_visits REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
BEGIN;
  -- Remove tables from publication first (ignore errors if they don't exist)
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Create publication with all needed tables
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.franchise_members,
    public.franchise_orders,
    public.website_visits,
    public.notifications,
    public.profiles,
    public.inventory,
    public.order_items,
    public.user_activity,
    public.analytics;
COMMIT;

-- Create function to track website visits
CREATE OR REPLACE FUNCTION public.track_website_visit(
  page_url text,
  visitor_ip text DEFAULT NULL,
  user_agent text DEFAULT NULL,
  referrer text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  visit_id uuid;
BEGIN
  INSERT INTO public.website_visits (page_url, visitor_ip, user_agent, referrer)
  VALUES (page_url, visitor_ip, user_agent, referrer)
  RETURNING id INTO visit_id;
  
  RETURN visit_id;
END;
$$;

-- Create notification function for new users
CREATE OR REPLACE FUNCTION public.notify_owner_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notification for owner about new user
  INSERT INTO public.notifications (
    type, 
    title, 
    message, 
    user_id, 
    data
  )
  SELECT 
    'new_user_registration',
    'New User Registration',
    'A new user ' || NEW.name || ' has registered and needs approval for dashboard access.',
    p.id,
    jsonb_build_object(
      'new_user_id', NEW.id,
      'new_user_email', NEW.email,
      'new_user_name', NEW.name,
      'registration_time', NEW.created_at
    )
  FROM public.profiles p
  WHERE p.role = 'owner';
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user notifications
DROP TRIGGER IF EXISTS notify_owner_new_user_trigger ON public.profiles;
CREATE TRIGGER notify_owner_new_user_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_owner_new_user();
