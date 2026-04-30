import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const priorityColors = { low: 'low', medium: 'medium', high: 'high', critical: 'critical' };

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/tasks/dashboard').then(r => r.data.data)
  });

  if (isLoading) return <div className="loading-spinner" />;

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="dash-date">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/projects" className="btn btn-primary">+ New Project</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">◫</div>
          <div className="stat-num">{stats?.totalProjects || 0}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✦</div>
          <div className="stat-num">{stats?.myTasks || 0}</div>
          <div className="stat-label">My Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-warning">⚠</div>
          <div className="stat-num stat-warning-num">{stats?.overdue || 0}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-success">✓</div>
          <div className="stat-num stat-success-num">{stats?.byStatus?.done || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3 className="card-title">Task Status</h3>
          <div className="status-bars">
            {[
              { key: 'todo', label: 'To Do', color: '#5a6480' },
              { key: 'inProgress', label: 'In Progress', color: '#38bdf8' },
              { key: 'review', label: 'Review', color: '#f59e0b' },
              { key: 'done', label: 'Done', color: '#22c55e' },
            ].map(s => {
              const val = stats?.byStatus?.[s.key] || 0;
              const total = stats?.myTasks || 1;
              return (
                <div key={s.key} className="status-bar-item">
                  <div className="status-bar-header">
                    <span>{s.label}</span>
                    <span>{val}</span>
                  </div>
                  <div className="status-bar-track">
                    <div
                      className="status-bar-fill"
                      style={{ width: `${(val / total) * 100}%`, background: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Recent Tasks</h3>
          {stats?.recentTasks?.length > 0 ? (
            <div className="recent-tasks">
              {stats.recentTasks.map(task => (
                <div key={task._id} className="recent-task-item">
                  <div className="task-info">
                    <div className="task-name">{task.title}</div>
                    <div className="task-project">{task.project?.name}</div>
                  </div>
                  <span className={`badge badge-${task.status}`}>
                    {statusLabels[task.status]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-sm">No tasks assigned yet</div>
          )}
          <Link to="/my-tasks" className="view-all-link">View all tasks →</Link>
        </div>
      </div>
    </div>
  );
}
