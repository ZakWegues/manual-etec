
-- Fix notifications INSERT policy: ensure user_id matches authenticated user
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Feedback INSERT is fine as-is since it's inserted via edge function with service role
-- but let's restrict to authenticated users explicitly
DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON public.feedback;
CREATE POLICY "Authenticated users can insert feedback" ON public.feedback
FOR INSERT TO authenticated WITH CHECK (true);
