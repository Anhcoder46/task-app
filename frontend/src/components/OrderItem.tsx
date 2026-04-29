import { useState, useRef } from 'react';
import type { Order } from '../types';
import { apiFetch } from '../lib/api';

interface OrderItemProps {
  order: Order;
  onUpdated: () => void;
}

export function OrderItem({ order, onUpdated }: OrderItemProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusLabels: Record<string, string> = {
    pending: '🔵 Open',
    shipping: '🟡 In Progress',
    delivered: '🟢 Done',
  };

  const nextStatus: Record<string, string> = {
    pending: 'shipping',
    shipping: 'delivered',
    delivered: 'pending',
  };

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus[order.status] }),
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

      const res = await apiFetch(`/api/orders/${order.id}/attachment`, {
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
      const res = await apiFetch(`/api/orders/${order.id}/attachment`, {
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
    <div className={`order-item order-${order.status}`} id={`order-${order.id}`}>
      <div className="order-header">
        <h4 className="order-customer_name">{order.customer_name}</h4>
        <button
          className={`status-badge status-${order.status}`}
          onClick={handleStatusChange}
          disabled={loading}
          title="Click để đổi trạng thái"
        >
          {statusLabels[order.status]}
        </button>
      </div>

      {order.product_name && (
        <p className="order-product_name">{order.product_name}</p>
      )}

      <div className="order-meta">
        <span className="order-date">📅 {formatDate(order.created_at)}</span>
      </div>

      {order.attachment_url ? (
        <div className="order-attachment">
          <a
            href={order.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="attachment-link"
          >
            📎 {order.attachment_name || 'Tải file'}
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
        <div className="order-upload">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
            }}
            className="hidden-file-input"
            id={`upload-${order.id}`}
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
