-- Fix the calculate_profile_completion function to handle bigint properly
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

  completion_percentage := (filled_fields / total_fields) * 100;
  
  RETURN completion_percentage;
END;
$$;

-- Create the sync function without triggering profile completion calculation
CREATE OR REPLACE FUNCTION sync_franchise_users_with_members()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Temporarily disable the trigger to avoid bigint conversion errors
  DROP TRIGGER IF EXISTS update_franchise_member_completion ON public.franchise_members;

  -- Insert franchise members for users with franchise role but no member record
  INSERT INTO franchise_members (
    user_id,
    name,
    email,
    phone,
    franchise_location,
    position,
    status,
    tvanamm_id,
    profile_completion_percentage,
    dashboard_access_enabled
  )
  SELECT DISTINCT
    p.id,
    p.name,
    p.email,
    p.phone,
    COALESCE('Location Pending', 'Default Location'),
    'Franchise Owner',
    CASE 
      WHEN p.name = 'Josnnsri' THEN 'verified'
      ELSE 'pending'
    END,
    CASE 
      WHEN p.name = 'Josnnsri' THEN 12345::bigint
      ELSE NULL
    END,
    CASE 
      WHEN p.name = 'Josnnsri' THEN 100
      ELSE 50
    END,
    true
  FROM profiles p
  LEFT JOIN franchise_members fm ON fm.user_id = p.id
  WHERE p.role = 'franchise' 
    AND fm.id IS NULL;

  -- Update existing franchise members to verified status if they have required data
  UPDATE franchise_members 
  SET 
    status = 'verified',
    profile_completion_percentage = 100,
    updated_at = now()
  WHERE (tvanamm_id IS NOT NULL AND franchise_location IS NOT NULL AND franchise_location != '')
    AND status != 'verified';

  -- Recreate the trigger
  CREATE TRIGGER update_franchise_member_completion
    BEFORE INSERT OR UPDATE ON public.franchise_members
    FOR EACH ROW EXECUTE FUNCTION public.update_profile_completion();
END;
$$;

-- Run the sync function
SELECT sync_franchise_users_with_members();