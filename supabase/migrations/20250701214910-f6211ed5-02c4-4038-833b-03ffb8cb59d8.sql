-- Fix the calculate_profile_completion function to handle bigint properly (updated)
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
    CASE WHEN tvanamm_id IS NOT NULL THEN 1 ELSE 0 END +  -- Fixed: removed string comparison for bigint
    CASE WHEN pincode IS NOT NULL AND pincode != '' THEN 1 ELSE 0 END +
    CASE WHEN state IS NOT NULL AND state != '' THEN 1 ELSE 0 END +
    CASE WHEN area IS NOT NULL AND area != '' THEN 1 ELSE 0 END +
    CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END +
    CASE WHEN franchise_location IS NOT NULL AND franchise_location != '' THEN 1 ELSE 0 END +
    CASE WHEN position IS NOT NULL AND position != '' THEN 1 ELSE 0 END
  INTO filled_fields
  FROM public.franchise_members
  WHERE id = member_id;

  -- Handle case when no member is found
  IF filled_fields IS NULL THEN
    filled_fields := 0;
  END IF;

  completion_percentage := (filled_fields / total_fields) * 100;
  
  RETURN completion_percentage;
END;
$$;

-- Ensure the trigger uses proper error handling
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN
    NEW.profile_completion_percentage := public.calculate_profile_completion(NEW.id);
  EXCEPTION
    WHEN OTHERS THEN
      -- If calculation fails, set a default value
      NEW.profile_completion_percentage := 0;
  END;
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure it's working properly
DROP TRIGGER IF EXISTS update_franchise_member_completion ON public.franchise_members;
CREATE TRIGGER update_franchise_member_completion
  BEFORE INSERT OR UPDATE ON public.franchise_members
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_completion();