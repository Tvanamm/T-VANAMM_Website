-- Phase 1: Create function to sync existing franchise users and fix statuses
CREATE OR REPLACE FUNCTION sync_franchise_users_with_members()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
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
END;
$$;

-- Run the sync function
SELECT sync_franchise_users_with_members();

-- Phase 2: Update the complete_franchise_onboarding function to be simpler
CREATE OR REPLACE FUNCTION complete_franchise_onboarding(
  target_user_id uuid,
  tvanamm_id_param bigint,
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
BEGIN
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
      tvanamm_id = tvanamm_id_param,
      franchise_location = franchise_location_param,
      status = 'verified',
      profile_completion_percentage = 100,
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
      tvanamm_id_param,
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
      'tvanamm_id', tvanamm_id_param,
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

-- Phase 4: Fix order confirmation by ensuring proper franchise member lookup
CREATE OR REPLACE FUNCTION get_franchise_member_by_order(order_uuid uuid)
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