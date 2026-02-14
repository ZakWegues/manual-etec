
-- Fix: Remove user_id parameter, use auth.uid() to prevent arbitrary user notification generation
CREATE OR REPLACE FUNCTION public.generate_activity_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT 
    auth.uid(),
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
      WHERE n.user_id = auth.uid() 
        AND n.link = '/activities/' || a.id
        AND n.created_at >= CURRENT_DATE
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.activity_progress ap
      WHERE ap.user_id = auth.uid() AND ap.activity_id = a.id
    );
END;
$function$;

-- Drop the old function with parameter
DROP FUNCTION IF EXISTS public.generate_activity_notifications(uuid);

-- Make PDFs bucket private
UPDATE storage.buckets SET public = false WHERE id = 'pdfs';

-- Drop the old public SELECT policy and create authenticated-only one
DROP POLICY IF EXISTS "Anyone can view PDFs" ON storage.objects;
CREATE POLICY "Authenticated users can view PDFs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'pdfs');
