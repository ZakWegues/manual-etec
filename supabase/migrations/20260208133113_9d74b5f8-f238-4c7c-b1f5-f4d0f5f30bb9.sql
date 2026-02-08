-- Create a table for multiple videos per activity
CREATE TABLE public.activity_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  title TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone authenticated can view activity videos"
ON public.activity_videos
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert activity videos"
ON public.activity_videos
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update activity videos"
ON public.activity_videos
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete activity videos"
ON public.activity_videos
FOR DELETE
USING (is_admin());

-- Create index for faster lookups
CREATE INDEX idx_activity_videos_activity_id ON public.activity_videos(activity_id);

-- Migrate existing youtube_url data to the new table
INSERT INTO public.activity_videos (activity_id, youtube_url, position)
SELECT id, youtube_url, 0
FROM public.activities
WHERE youtube_url IS NOT NULL AND youtube_url != '';