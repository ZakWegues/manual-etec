-- Add created_by column to track who created the activity
ALTER TABLE public.activities ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Backfill: set existing activities' created_by to the first admin user
UPDATE public.activities SET created_by = (
  SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1
) WHERE created_by IS NULL;