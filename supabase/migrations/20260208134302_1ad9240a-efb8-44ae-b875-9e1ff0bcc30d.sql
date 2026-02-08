-- Drop the old permissive policy that allows unrestricted service role inserts
DROP POLICY IF EXISTS "Service role can insert feedback" ON public.feedback;

-- Create a new policy that only allows authenticated users to insert feedback
CREATE POLICY "Authenticated users can insert feedback"
ON public.feedback
FOR INSERT
TO authenticated
WITH CHECK (true);
