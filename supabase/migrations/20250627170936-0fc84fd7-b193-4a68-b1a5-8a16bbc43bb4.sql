
-- Add GST rate to inventory table
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS gst_rate numeric DEFAULT 18.0;

-- Create user activity tracking table
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user status tracking table
CREATE TABLE IF NOT EXISTS public.user_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status text DEFAULT 'offline',
  last_seen timestamp with time zone DEFAULT now(),
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create notification delivery tracking table
CREATE TABLE IF NOT EXISTS public.notification_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  delivered_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  status text DEFAULT 'delivered'
);

-- Enable RLS on new tables
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_activity
CREATE POLICY "Users can view their own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON public.user_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for user_status
CREATE POLICY "Users can view their own status" ON public.user_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own status" ON public.user_status
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all status" ON public.user_status
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for notification_delivery
CREATE POLICY "Users can view their own delivery status" ON public.notification_delivery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all delivery status" ON public.notification_delivery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_status_updated_at 
  BEFORE UPDATE ON public.user_status 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for new tables
ALTER TABLE public.user_activity REPLICA IDENTITY FULL;
ALTER TABLE public.user_status REPLICA IDENTITY FULL;
ALTER TABLE public.notification_delivery REPLICA IDENTITY FULL;
