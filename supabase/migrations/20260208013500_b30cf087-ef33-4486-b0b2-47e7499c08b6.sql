-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'compliment', 'other')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Only admins can view feedback
CREATE POLICY "Admins can view all feedback"
ON public.feedback
FOR SELECT
USING (is_admin());

-- Only admins can update feedback (mark as read)
CREATE POLICY "Admins can update feedback"
ON public.feedback
FOR UPDATE
USING (is_admin());

-- Only admins can delete feedback
CREATE POLICY "Admins can delete feedback"
ON public.feedback
FOR DELETE
USING (is_admin());

-- Anyone can insert feedback (using service role in edge function)
CREATE POLICY "Service role can insert feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);