
-- 1. Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN avatar_url text;

-- 2. Create avatars bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 3. Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- System/admin can insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- 5. Function to generate deadline notifications
CREATE OR REPLACE FUNCTION public.generate_activity_notifications(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notifications for activities due in 1-3 days that don't already have a notification
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT 
    p_user_id,
    'Prazo próximo: ' || a.title,
    'A atividade "' || a.title || '" vence em ' || 
      CASE 
        WHEN a.due_date = CURRENT_DATE THEN 'hoje!'
        WHEN a.due_date = CURRENT_DATE + 1 THEN 'amanhã!'
        ELSE (a.due_date - CURRENT_DATE) || ' dias.'
      END,
    CASE 
      WHEN a.due_date = CURRENT_DATE THEN 'urgent'
      WHEN a.due_date = CURRENT_DATE + 1 THEN 'warning'
      ELSE 'info'
    END,
    '/activities/' || a.id
  FROM public.activities a
  WHERE a.due_date >= CURRENT_DATE 
    AND a.due_date <= CURRENT_DATE + 3
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = p_user_id 
        AND n.link = '/activities/' || a.id
        AND n.created_at >= CURRENT_DATE
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.activity_progress ap
      WHERE ap.user_id = p_user_id AND ap.activity_id = a.id
    );
END;
$$;
