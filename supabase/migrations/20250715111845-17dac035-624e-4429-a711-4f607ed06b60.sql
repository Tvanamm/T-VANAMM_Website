-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', false);

-- Create storage policies for invoices
CREATE POLICY "Users can view their own invoice files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'invoices' AND 
  name LIKE '%/' || auth.uid()::text || '/%'
);

CREATE POLICY "Admins and owners can view all invoice files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'invoices' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

CREATE POLICY "System can manage invoice files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'invoices');