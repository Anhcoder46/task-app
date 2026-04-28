import { useState, FormEvent, useRef } from 'react';
import { apiFetch } from '../lib/api';

interface TaskFormProps {
  onTaskCreated: () => void;
}

export function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      if (file) formData.append('file', file);

      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      setTitle('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onTaskCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form" id="task-form">
      <h2 className="form-title">
        <span className="form-icon">✨</span>
        Tạo Task Mới
      </h2>

      {error && <div className="form-error" id="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="task-title">Tiêu đề *</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề task..."
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-description">Mô tả</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả chi tiết..."
          rows={3}
          className="form-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="task-file">Đính kèm file</label>
        <input
          id="task-file"
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="form-file"
        />
        {file && (
          <span className="file-name">📎 {file.name}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="form-submit"
        id="submit-task"
      >
        {loading ? (
          <span className="loading-spinner">⏳ Đang tạo...</span>
        ) : (
          <span>🚀 Tạo Task</span>
        )}
      </button>
    </form>
  );
}
