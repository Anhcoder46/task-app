import type { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated: () => void;
  loading: boolean;
}

export function TaskList({ tasks, onTaskUpdated, loading }: TaskListProps) {
  if (loading) {
    return (
      <div className="task-list-empty" id="task-list-loading">
        <div className="loading-pulse">
          <span className="pulse-icon">⏳</span>
          <p>Đang tải danh sách task...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty" id="task-list-empty">
        <span className="empty-icon">📋</span>
        <h3>Chưa có task nào</h3>
        <p>Tạo task đầu tiên để bắt đầu!</p>
      </div>
    );
  }

  const openTasks = tasks.filter(t => t.status === 'open');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="task-list" id="task-list">
      <div className="task-stats">
        <div className="stat stat-open">
          <span className="stat-count">{openTasks.length}</span>
          <span className="stat-label">Mở</span>
        </div>
        <div className="stat stat-progress">
          <span className="stat-count">{inProgressTasks.length}</span>
          <span className="stat-label">Đang làm</span>
        </div>
        <div className="stat stat-done">
          <span className="stat-count">{doneTasks.length}</span>
          <span className="stat-label">Hoàn thành</span>
        </div>
      </div>

      {openTasks.length > 0 && (
        <div className="task-section">
          <h3 className="section-title section-open">🔵 Open ({openTasks.length})</h3>
          {openTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdated={onTaskUpdated} />
          ))}
        </div>
      )}

      {inProgressTasks.length > 0 && (
        <div className="task-section">
          <h3 className="section-title section-progress">🟡 In Progress ({inProgressTasks.length})</h3>
          {inProgressTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdated={onTaskUpdated} />
          ))}
        </div>
      )}

      {doneTasks.length > 0 && (
        <div className="task-section">
          <h3 className="section-title section-done">🟢 Done ({doneTasks.length})</h3>
          {doneTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdated={onTaskUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
