
-- Fix activity_comments: restrict SELECT to authenticated only
DROP POLICY "Anyone authenticated can view comments" ON public.activity_comments;
CREATE POLICY "Authenticated users can view comments"
  ON public.activity_comments FOR SELECT TO authenticated USING (true);

-- Fix shared_materials: restrict SELECT to authenticated only
DROP POLICY "Anyone authenticated can view shared materials" ON public.shared_materials;
CREATE POLICY "Authenticated users can view shared materials"
  ON public.shared_materials FOR SELECT TO authenticated USING (true);

-- Fix activity_videos: restrict SELECT to authenticated only
DROP POLICY "Anyone authenticated can view activity videos" ON public.activity_videos;
CREATE POLICY "Authenticated users can view activity videos"
  ON public.activity_videos FOR SELECT TO authenticated USING (true);
