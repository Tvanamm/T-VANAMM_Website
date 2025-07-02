
-- Fix and enhance database structure for franchise management system

-- Ensure form_follow_ups table exists with proper structure
CREATE TABLE IF NOT EXISTS public.form_follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_submission_id UUID REFERENCES public.form_submissions(id) ON DELETE CASCADE,
  follow_up_type TEXT NOT NULL DEFAULT 'call',
  notes TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to form_submissions if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'contacted_at') THEN
    ALTER TABLE public.form_submissions ADD COLUMN contacted_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'contact_notes') THEN
    ALTER TABLE public.form_submissions ADD COLUMN contact_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_submissions' AND column_name = 'converted_at') THEN
    ALTER TABLE public.form_submissions ADD COLUMN converted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add TVANAMM ID as text instead of bigint for better handling
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'franchise_members' AND column_name = 'tvanamm_id' AND data_type = 'bigint') THEN
    ALTER TABLE public.franchise_members ALTER COLUMN tvanamm_id TYPE TEXT USING tvanamm_id::TEXT;
  END IF;
END $$;

-- Add transportation_fee column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'franchise_members' AND column_name = 'transportation_fee') THEN
    ALTER TABLE public.franchise_members ADD COLUMN transportation_fee NUMERIC DEFAULT 50;
  END IF;
END $$;

-- Enable RLS on form_follow_ups
ALTER TABLE public.form_follow_ups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for form_follow_ups
CREATE POLICY "Owners and admins can manage form follow-ups" 
  ON public.form_follow_ups 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Update form_submissions RLS to allow status updates
DROP POLICY IF EXISTS "Owners and admins can update form submissions" ON public.form_submissions;
CREATE POLICY "Owners and admins can update form submissions" 
  ON public.form_submissions 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_franchise_members_user_id ON public.franchise_members(user_id);
CREATE INDEX IF NOT EXISTS idx_franchise_members_status ON public.franchise_members(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON public.form_submissions(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Create function to handle franchise member onboarding
CREATE OR REPLACE FUNCTION public.complete_franchise_onboarding(
  target_user_id UUID,
  tvanamm_id_param TEXT,
  franchise_location_param TEXT,
  position_param TEXT DEFAULT 'Franchise Owner',
  phone_param TEXT DEFAULT NULL,
  pincode_param TEXT DEFAULT NULL,
  state_param TEXT DEFAULT NULL,
  area_param TEXT DEFAULT NULL,
  city_param TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Check if current user is owner or admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')) THEN
    RAISE EXCEPTION 'Access denied. Only owners and admins can complete franchise onboarding.';
  END IF;
  
  -- Get target user profile
  SELECT * INTO user_profile FROM profiles WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;
  
  -- Update or insert franchise member record
  INSERT INTO franchise_members (
    user_id,
    name,
    email,
    phone,
    franchise_location,
    position,
    tvanamm_id,
    pincode,
    state,
    area,
    city,
    status
  )
  VALUES (
    target_user_id,
    user_profile.name,
    user_profile.email,
    COALESCE(phone_param, user_profile.phone),
    franchise_location_param,
    position_param,
    tvanamm_id_param,
    pincode_param,
    state_param,
    area_param,
    city_param,
    'verified'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tvanamm_id = tvanamm_id_param,
    franchise_location = franchise_location_param,
    position = position_param,
    phone = COALESCE(phone_param, user_profile.phone),
    pincode = pincode_param,
    state = state_param,
    area = area_param,
    city = city_param,
    status = 'verified',
    updated_at = now();
  
  -- Update profile completion percentage
  UPDATE franchise_members 
  SET profile_completion_percentage = public.calculate_profile_completion(
    CASE WHEN user_id IS NULL THEN id ELSE (SELECT id FROM franchise_members WHERE user_id = target_user_id) END
  )
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to complete franchise onboarding: %', SQLERRM;
END;
$$;

-- Enable realtime for better real-time updates
ALTER TABLE public.franchise_members REPLICA IDENTITY FULL;
ALTER TABLE public.form_submissions REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.franchise_orders REPLICA IDENTITY FULL;
ALTER TABLE public.inventory REPLICA IDENTITY FULL;
ALTER TABLE public.loyalty_points REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.franchise_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.form_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.franchise_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_points;
