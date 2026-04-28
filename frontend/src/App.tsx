import { useState, useCallback, useEffect } from 'react';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { ChatBox } from './components/ChatBox';
import { useRealtimeTasks } from './hooks/useRealtimeTasks';
import { apiFetch } from './lib/api';
import type { Task } from './types';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat'>('tasks');

  const handleTaskChange = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    setLoading(false);
  }, []);

  const { refetch } = useRealtimeTasks(handleTaskChange);

  // Initial fetch via API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiFetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
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
              <h1>Task Manager</h1>
              <p className="header-subtitle">Quản lý công việc realtime</p>
            </div>
          </div>
          <nav className="tab-nav" id="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'tasks' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('tasks')}
              id="tab-tasks"
            >
              📋 Tasks
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
        {activeTab === 'tasks' ? (
          <div className="tasks-layout">
            <aside className="tasks-sidebar">
              <TaskForm onTaskCreated={refetch} />
            </aside>
            <section className="tasks-content">
              <TaskList tasks={tasks} onTaskUpdated={refetch} loading={loading} />
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
        <p>Task Management App — DevOps Lab © 2026</p>
      </footer>
    </div>
  );
}

export default App;
