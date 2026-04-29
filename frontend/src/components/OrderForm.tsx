import { useState, FormEvent, useRef } from 'react';
import { apiFetch } from '../lib/api';

interface OrderFormProps {
  onOrderCreated: () => void;
}

export function OrderForm({ onOrderCreated }: OrderFormProps) {
  const [customer_name, setTitle] = useState('');
  const [product_name, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customer_name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('customer_name', customer_name.trim());
      if (product_name.trim()) formData.append('product_name', product_name.trim());
      if (file) formData.append('file', file);

      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      setTitle('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onOrderCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-form" id="order-form">
      <h2 className="form-customer_name">
        <span className="form-icon">✨</span>
        Tạo Order Mới
      </h2>

      {error && <div className="form-error" id="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="order-customer_name">Tên Khách Hàng *</label>
        <input
          id="order-customer_name"
          type="text"
          value={customer_name}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề order..."
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="order-product_name">Tên Sản Phẩm</label>
        <textarea
          id="order-product_name"
          value={product_name}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập tên sản phẩm..."
          rows={3}
          className="form-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="order-file">Đính kèm file</label>
        <input
          id="order-file"
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
        disabled={loading || !customer_name.trim()}
        className="form-submit"
        id="submit-order"
      >
        {loading ? (
          <span className="loading-spinner">⏳ Đang tạo...</span>
        ) : (
          <span>🚀 Tạo Order</span>
        )}
      </button>
    </form>
  );
}
