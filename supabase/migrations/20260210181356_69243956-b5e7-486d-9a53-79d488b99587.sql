
-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true);

-- Storage policies for PDFs
CREATE POLICY "Anyone can view PDFs" ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');
CREATE POLICY "Admins can upload PDFs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND public.is_admin());
CREATE POLICY "Admins can update PDFs" ON storage.objects FOR UPDATE USING (bucket_id = 'pdfs' AND public.is_admin());
CREATE POLICY "Admins can delete PDFs" ON storage.objects FOR DELETE USING (bucket_id = 'pdfs' AND public.is_admin());

-- Add type and file_url to activity_videos
ALTER TABLE public.activity_videos ADD COLUMN type text NOT NULL DEFAULT 'video';
ALTER TABLE public.activity_videos ADD COLUMN file_url text;

-- Add type and file_url to study_videos
ALTER TABLE public.study_videos ADD COLUMN type text NOT NULL DEFAULT 'video';
ALTER TABLE public.study_videos ADD COLUMN file_url text;
