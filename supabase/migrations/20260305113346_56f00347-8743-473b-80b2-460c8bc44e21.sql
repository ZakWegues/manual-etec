
-- Create a function to calculate user rankings
-- Scoring: 
--   Completed activity: 10pts
--   On-time completion (before due_date): +5pts bonus
--   Late completion: -3pts penalty
--   Grade entry: (grade/max_grade) * 10pts
--   Comment: 2pts
--   Shared material: 5pts

CREATE OR REPLACE FUNCTION public.get_user_rankings(p_subject_id uuid DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  total_score integer,
  activities_completed integer,
  on_time_count integer,
  avg_grade numeric,
  rank_position integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH user_activity_scores AS (
    SELECT 
      ap.user_id,
      COUNT(*)::integer AS completed,
      COUNT(*) FILTER (WHERE ap.completed_at::date <= a.due_date)::integer AS on_time,
      (COUNT(*) * 10 
       + COUNT(*) FILTER (WHERE ap.completed_at::date <= a.due_date) * 5
       - COUNT(*) FILTER (WHERE ap.completed_at::date > a.due_date) * 3
      )::integer AS activity_score
    FROM activity_progress ap
    JOIN activities a ON a.id = ap.activity_id
    WHERE (p_subject_id IS NULL OR a.subject_id = p_subject_id)
    GROUP BY ap.user_id
  ),
  user_grade_scores AS (
    SELECT 
      g.user_id,
      ROUND(AVG(g.grade / NULLIF(g.max_grade, 0) * 100), 1) AS avg_grade,
      SUM(ROUND(g.grade / NULLIF(g.max_grade, 0) * 10))::integer AS grade_score
    FROM grades g
    WHERE (p_subject_id IS NULL OR g.subject_id = p_subject_id)
    GROUP BY g.user_id
  ),
  user_social_scores AS (
    SELECT 
      sub.user_id,
      sub.social_score::integer
    FROM (
      SELECT user_id, SUM(pts) AS social_score FROM (
        SELECT ac.user_id, COUNT(*) * 2 AS pts
        FROM activity_comments ac
        GROUP BY ac.user_id
        UNION ALL
        SELECT sm.user_id, COUNT(*) * 5 AS pts
        FROM shared_materials sm
        GROUP BY sm.user_id
      ) x
      GROUP BY user_id
    ) sub
  ),
  combined AS (
    SELECT 
      p.user_id,
      p.full_name,
      p.avatar_url,
      (COALESCE(uas.activity_score, 0) + COALESCE(ugs.grade_score, 0) + COALESCE(uss.social_score, 0))::integer AS total_score,
      COALESCE(uas.completed, 0) AS activities_completed,
      COALESCE(uas.on_time, 0) AS on_time_count,
      COALESCE(ugs.avg_grade, 0) AS avg_grade
    FROM profiles p
    LEFT JOIN user_activity_scores uas ON uas.user_id = p.user_id
    LEFT JOIN user_grade_scores ugs ON ugs.user_id = p.user_id
    LEFT JOIN user_social_scores uss ON uss.user_id = p.user_id
    WHERE (COALESCE(uas.activity_score, 0) + COALESCE(ugs.grade_score, 0) + COALESCE(uss.social_score, 0)) > 0
  )
  SELECT 
    c.user_id,
    c.full_name,
    c.avatar_url,
    c.total_score,
    c.activities_completed,
    c.on_time_count,
    c.avg_grade,
    ROW_NUMBER() OVER (ORDER BY c.total_score DESC, c.activities_completed DESC)::integer AS rank_position
  FROM combined c
  ORDER BY rank_position;
$$;
