
-- Create grades table
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  grade decimal NOT NULL,
  max_grade decimal NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Users can view their own grades
CREATE POLICY "Users can view their own grades"
ON public.grades FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own grades
CREATE POLICY "Users can insert their own grades"
ON public.grades FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own grades
CREATE POLICY "Users can update their own grades"
ON public.grades FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own grades
CREATE POLICY "Users can delete their own grades"
ON public.grades FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all grades
CREATE POLICY "Admins can view all grades"
ON public.grades FOR SELECT
USING (public.is_admin());

-- Index for performance
CREATE INDEX idx_grades_user_id ON public.grades(user_id);
CREATE INDEX idx_grades_subject_id ON public.grades(subject_id);
