-- Add missing columns to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS contact_notes TEXT,
ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Create form_follow_ups table
CREATE TABLE IF NOT EXISTS public.form_follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_submission_id UUID NOT NULL REFERENCES public.form_submissions(id),
  follow_up_type TEXT NOT NULL,
  notes TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on form_follow_ups
ALTER TABLE public.form_follow_ups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for form_follow_ups
CREATE POLICY "Owners and admins can manage form follow-ups" 
ON public.form_follow_ups 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('owner', 'admin')
));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_form_follow_ups_submission_id ON public.form_follow_ups(form_submission_id);

-- Update the cleanup function to include form_follow_ups
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_notifications INTEGER := 0;
  deleted_forms INTEGER := 0;
  deleted_follow_ups INTEGER := 0;
BEGIN
  -- Delete old notifications (30+ days)
  DELETE FROM public.notifications 
  WHERE created_at < (NOW() - INTERVAL '30 days')
  AND read = true;
  
  GET DIAGNOSTICS deleted_notifications = ROW_COUNT;
  
  -- Archive old form submissions (keep for reference but mark as archived)
  UPDATE public.form_submissions 
  SET status = 'archived'
  WHERE created_at < (NOW() - INTERVAL '30 days')
  AND status IN ('pending', 'contacted');
  
  GET DIAGNOSTICS deleted_forms = ROW_COUNT;
  
  -- Delete old form follow-ups (90+ days to keep longer history)
  DELETE FROM public.form_follow_ups 
  WHERE created_at < (NOW() - INTERVAL '90 days');
  
  GET DIAGNOSTICS deleted_follow_ups = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO public.cleanup_logs (cleanup_type, records_deleted, details)
  VALUES (
    'automated_cleanup',
    deleted_notifications + deleted_forms + deleted_follow_ups,
    jsonb_build_object(
      'notifications_deleted', deleted_notifications,
      'forms_archived', deleted_forms,
      'follow_ups_deleted', deleted_follow_ups,
      'cleanup_date', now()
    )
  );
  
END;
$function$;