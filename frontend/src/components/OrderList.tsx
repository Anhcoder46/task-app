import type { Order } from '../types';
import { OrderItem } from './OrderItem';

interface OrderListProps {
  orders: Order[];
  onOrderUpdated: () => void;
  loading: boolean;
}

export function OrderList({ orders, onOrderUpdated, loading }: OrderListProps) {
  if (loading) {
    return (
      <div className="order-list-empty" id="order-list-loading">
        <div className="loading-pulse">
          <span className="pulse-icon">⏳</span>
          <p>Đang tải danh sách order...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="order-list-empty" id="order-list-empty">
        <span className="empty-icon">📋</span>
        <h3>Chưa có order nào</h3>
        <p>Tạo order đầu tiên để bắt đầu!</p>
      </div>
    );
  }

  const openOrders = orders.filter(t => t.status === 'pending');
  const inProgressOrders = orders.filter(t => t.status === 'shipping');
  const doneOrders = orders.filter(t => t.status === 'delivered');

  return (
    <div className="order-list" id="order-list">
      <div className="order-stats">
        <div className="stat stat-pending">
          <span className="stat-count">{openOrders.length}</span>
          <span className="stat-label">Mở</span>
        </div>
        <div className="stat stat-progress">
          <span className="stat-count">{inProgressOrders.length}</span>
          <span className="stat-label">Đang làm</span>
        </div>
        <div className="stat stat-delivered">
          <span className="stat-count">{doneOrders.length}</span>
          <span className="stat-label">Hoàn thành</span>
        </div>
      </div>

      {openOrders.length > 0 && (
        <div className="order-section">
          <h3 className="section-customer_name section-pending">🔵 Open ({openOrders.length})</h3>
          {openOrders.map(order => (
            <OrderItem key={order.id} order={order} onUpdated={onOrderUpdated} />
          ))}
        </div>
      )}

      {inProgressOrders.length > 0 && (
        <div className="order-section">
          <h3 className="section-customer_name section-progress">🟡 In Progress ({inProgressOrders.length})</h3>
          {inProgressOrders.map(order => (
            <OrderItem key={order.id} order={order} onUpdated={onOrderUpdated} />
          ))}
        </div>
      )}

      {doneOrders.length > 0 && (
        <div className="order-section">
          <h3 className="section-customer_name section-delivered">🟢 Done ({doneOrders.length})</h3>
          {doneOrders.map(order => (
            <OrderItem key={order.id} order={order} onUpdated={onOrderUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
