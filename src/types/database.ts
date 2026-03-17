// Custom types for our application
export type AppRole = 'admin' | 'user';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export const ACTIVITY_TYPES = [
  { value: 'prova', label: 'Prova' },
  { value: 'lista', label: 'Lista de Exercícios' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'seminario', label: 'Seminário' },
  { value: 'projeto', label: 'Projeto' },
  { value: 'other', label: 'Outro' },
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number]['value'];

export interface Activity {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  due_date: string;
  youtube_url: string | null;
  activity_type: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  videos?: ActivityVideo[];
}

export interface ActivityVideo {
  id: string;
  activity_id: string;
  youtube_url: string;
  title: string | null;
  position: number;
  created_at: string;
  type: string;
  file_url: string | null;
}

export interface Schedule {
  id: string;
  day_of_week: number;
  period: number;
  subject_id: string | null;
  custom_text: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface ActivityProgress {
  id: string;
  user_id: string;
  activity_id: string;
  completed_at: string;
}

export interface StudyVideo {
  id: string;
  subject_id: string;
  title: string;
  youtube_url: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  type: string;
  file_url: string | null;
}

export interface Grade {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  grade: number;
  max_grade: number;
  created_at: string;
  subject?: Subject;
}

export interface ActivityWithProgress extends Activity {
  is_completed: boolean;
}