import { getSupabaseAdmin, STORAGE_BUCKET } from '../lib/supabase.js';
import crypto from 'crypto';

// GET /api/tasks
export async function listTasks(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[listTasks]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/tasks
export async function createTask(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let attachment_url = null;
    let attachment_name = null;

    // Handle file upload if present
    if (req.file) {
      const fileName = `${crypto.randomUUID()}-${req.file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      attachment_url = urlData.publicUrl;
      attachment_name = req.file.originalname;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        attachment_url,
        attachment_name,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[createTask]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// PATCH /api/tasks/:id/status
export async function updateTaskStatus(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Task not found' });

    res.json(data);
  } catch (err) {
    console.error('[updateTaskStatus]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/tasks/:id/attachment
export async function uploadAttachment(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileName = `${crypto.randomUUID()}-${req.file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('tasks')
      .update({
        attachment_url: urlData.publicUrl,
        attachment_name: req.file.originalname,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[uploadAttachment]', err.message);
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/tasks/:id/attachment
export async function deleteAttachment(req, res) {
  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.params;

    // Get current task to find the file path
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('attachment_url')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (task?.attachment_url) {
      // Extract file name from URL
      const urlParts = task.attachment_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([fileName]);
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        attachment_url: null,
        attachment_name: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[deleteAttachment]', err.message);
    res.status(500).json({ error: err.message });
  }
}
