
-- Create activity_comments table
CREATE TABLE public.activity_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view comments"
ON public.activity_comments FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own comments"
ON public.activity_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.activity_comments FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
ON public.activity_comments FOR DELETE
USING (is_admin());

-- Create shared_materials table
CREATE TABLE public.shared_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view shared materials"
ON public.shared_materials FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own materials"
ON public.shared_materials FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
ON public.shared_materials FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials"
ON public.shared_materials FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any material"
ON public.shared_materials FOR DELETE
USING (is_admin());
