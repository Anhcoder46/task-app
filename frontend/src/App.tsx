import { useState, useCallback, useEffect } from 'react';
import { OrderForm } from './components/OrderForm';
import { OrderList } from './components/OrderList';
import { ChatBox } from './components/ChatBox';
import { useRealtimeOrders } from './hooks/useRealtimeOrders';
import { apiFetch } from './lib/api';
import type { Order } from './types';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'chat'>('orders');

  const handleOrderChange = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
    setLoading(false);
  }, []);

  const { refetch } = useRealtimeOrders(handleOrderChange);

  // Initial fetch via API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiFetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="bg-decoration">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      {/* Header */}
      <header className="app-header" id="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">✅</span>
            <div>
              <h1>Order Manager</h1>
              <p className="header-subtitle">Hệ thống theo dõi đơn hàng realtime</p>
            </div>
          </div>
          <nav className="tab-nav" id="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('orders')}
              id="tab-orders"
            >
              📋 Orders
            </button>
            <button
              className={`tab-btn ${activeTab === 'chat' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('chat')}
              id="tab-chat"
            >
              💬 Chat
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {activeTab === 'orders' ? (
          <div className="orders-layout">
            <aside className="orders-sidebar">
              <OrderForm onOrderCreated={refetch} />
            </aside>
            <section className="orders-content">
              <OrderList orders={orders} onOrderUpdated={refetch} loading={loading} />
            </section>
          </div>
        ) : (
          <div className="chat-layout">
            <ChatBox />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Order Management App — DevOps Lab © 2026</p>
      </footer>
    </div>
  );
}

export default App;
