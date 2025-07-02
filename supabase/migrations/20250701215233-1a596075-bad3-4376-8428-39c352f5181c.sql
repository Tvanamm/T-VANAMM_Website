-- Drop all problematic triggers that might reference transportation_fee
DROP TRIGGER IF EXISTS sync_franchise_delivery_fee ON public.franchise_members;
DROP TRIGGER IF EXISTS update_delivery_settings ON public.franchise_members;
DROP TRIGGER IF EXISTS sync_delivery_fee_trigger ON public.franchise_members;

-- List and drop any function that references transportation_fee
DROP FUNCTION IF EXISTS public.sync_franchise_delivery_fee() CASCADE;

-- Make sure the franchise onboarding function is clean
CREATE OR REPLACE FUNCTION public.complete_franchise_onboarding(
  target_user_id uuid,
  tvanamm_id_param text,
  franchise_location_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_profile RECORD;
  member_record RECORD;
  tvanamm_id_bigint bigint;
BEGIN
  -- Validate and convert tvanamm_id from text to bigint, handle empty strings
  BEGIN
    IF tvanamm_id_param IS NULL OR trim(tvanamm_id_param) = '' THEN
      RAISE EXCEPTION 'TVANAMM ID cannot be empty';
    END IF;
    
    tvanamm_id_bigint := trim(tvanamm_id_param)::bigint;
    
    IF tvanamm_id_bigint <= 0 THEN
      RAISE EXCEPTION 'TVANAMM ID must be a positive number';
    END IF;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Invalid TVANAMM ID format: must be a number';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid TVANAMM ID: %', tvanamm_id_param;
  END;

  -- Validate franchise location
  IF franchise_location_param IS NULL OR trim(franchise_location_param) = '' THEN
    RAISE EXCEPTION 'Franchise location cannot be empty';
  END IF;

  -- Check if current user is owner or admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')) THEN
    RAISE EXCEPTION 'Access denied. Only owners and admins can complete franchise onboarding.';
  END IF;

  -- Get user profile data
  SELECT * INTO user_profile FROM profiles WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check if franchise member record exists
  SELECT * INTO member_record FROM franchise_members WHERE user_id = target_user_id;
  
  IF FOUND THEN
    -- Update existing record (disable trigger temporarily to avoid issues)
    UPDATE franchise_members 
    SET 
      tvanamm_id = tvanamm_id_bigint,
      franchise_location = trim(franchise_location_param),
      status = 'verified',
      profile_completion_percentage = 100,
      dashboard_access_enabled = true,
      updated_at = now()
    WHERE user_id = target_user_id;
  ELSE
    -- Create new record using profile data
    INSERT INTO franchise_members (
      user_id,
      name,
      email,
      phone,
      franchise_location,
      tvanamm_id,
      position,
      status,
      profile_completion_percentage,
      dashboard_access_enabled
    )
    VALUES (
      target_user_id,
      user_profile.name,
      user_profile.email,
      user_profile.phone,
      trim(franchise_location_param),
      tvanamm_id_bigint,
      'Franchise Owner',
      'verified',
      100,
      true
    );
  END IF;

  -- Create success notification
  INSERT INTO notifications (
    type,
    title,
    message,
    user_id,
    data
  )
  VALUES (
    'franchise_onboarding_complete',
    'Franchise Onboarding Complete',
    'Your franchise onboarding has been completed successfully. You now have full access to the franchise dashboard.',
    target_user_id,
    jsonb_build_object(
      'tvanamm_id', tvanamm_id_bigint,
      'franchise_location', trim(franchise_location_param),
      'status', 'verified'
    )
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to complete onboarding: %', SQLERRM;
END;
$$;