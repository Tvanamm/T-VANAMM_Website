-- Create missing complete_franchise_onboarding function
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
  -- Validate and convert tvanamm_id from text to bigint
  BEGIN
    tvanamm_id_bigint := tvanamm_id_param::bigint;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid TVANAMM ID format: %', tvanamm_id_param;
  END;

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
    -- Update existing record
    UPDATE franchise_members 
    SET 
      tvanamm_id = tvanamm_id_bigint,
      franchise_location = franchise_location_param,
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
      franchise_location_param,
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
      'franchise_location', franchise_location_param,
      'status', 'verified'
    )
  );

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to complete onboarding: %', SQLERRM;
END;
$$;

-- Create function to update dashboard access
CREATE OR REPLACE FUNCTION public.update_franchise_dashboard_access(
  target_member_id uuid,
  access_enabled boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user is owner or admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')) THEN
    RAISE EXCEPTION 'Access denied. Only owners and admins can update dashboard access.';
  END IF;

  -- Update dashboard access
  UPDATE franchise_members 
  SET 
    dashboard_access_enabled = access_enabled,
    updated_at = now()
  WHERE id = target_member_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Franchise member not found';
  END IF;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update dashboard access: %', SQLERRM;
END;
$$;

-- Create get_franchise_member_by_order function
CREATE OR REPLACE FUNCTION public.get_franchise_member_by_order(order_uuid uuid)
RETURNS TABLE(
  member_id uuid,
  user_id uuid,
  name text,
  email text,
  phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fm.id,
    fm.user_id,
    fm.name,
    fm.email,
    fm.phone
  FROM franchise_orders fo
  JOIN franchise_members fm ON fm.id = fo.franchise_member_id
  WHERE fo.id = order_uuid;
END;
$$;