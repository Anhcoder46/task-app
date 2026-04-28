import { getSupabaseAdmin } from '../lib/supabase.js';

// GET /api/messages
export async function listMessages(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[listMessages]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/messages
export async function sendMessage(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { user_name, content } = req.body;

    if (!user_name || !content) {
      return res.status(400).json({ error: 'user_name and content are required' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({ user_name, content })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[sendMessage]', err.message);
    res.status(500).json({ error: err.message });
  }
}
