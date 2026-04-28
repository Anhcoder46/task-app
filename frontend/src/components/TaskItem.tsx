import { useState, useRef } from 'react';
import type { Task } from '../types';
import { apiFetch } from '../lib/api';

interface TaskItemProps {
  task: Task;
  onUpdated: () => void;
}

export function TaskItem({ task, onUpdated }: TaskItemProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusLabels: Record<string, string> = {
    open: '🔵 Open',
    in_progress: '🟡 In Progress',
    done: '🟢 Done',
  };

  const nextStatus: Record<string, string> = {
    open: 'in_progress',
    in_progress: 'done',
    done: 'open',
  };

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus[task.status] }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      onUpdated();
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiFetch(`/api/tasks/${task.id}/attachment`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload file');
      onUpdated();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/tasks/${task.id}/attachment`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete attachment');
      onUpdated();
    } catch (err) {
      console.error('Delete attachment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`task-item task-${task.status}`} id={`task-${task.id}`}>
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <button
          className={`status-badge status-${task.status}`}
          onClick={handleStatusChange}
          disabled={loading}
          title="Click để đổi trạng thái"
        >
          {statusLabels[task.status]}
        </button>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className="task-date">📅 {formatDate(task.created_at)}</span>
      </div>

      {task.attachment_url ? (
        <div className="task-attachment">
          <a
            href={task.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="attachment-link"
          >
            📎 {task.attachment_name || 'Tải file'}
          </a>
          <button
            className="attachment-delete"
            onClick={handleDeleteAttachment}
            disabled={loading}
            title="Xóa file đính kèm"
          >
            🗑️
          </button>
        </div>
      ) : (
        <div className="task-upload">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
            }}
            className="hidden-file-input"
            id={`upload-${task.id}`}
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳ Đang upload...' : '📤 Upload file'}
          </button>
        </div>
      )}
    </div>
  );
}
