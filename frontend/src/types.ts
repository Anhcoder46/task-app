export interface Order {
  id: string;
  customer_name: string;
  product_name: string | null;
  status: 'pending' | 'shipping' | 'delivered';
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
