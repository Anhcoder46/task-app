export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'done';
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id?: string;
  user_name: string;
  content: string;
  created_at?: string;
  timestamp?: number;
}
