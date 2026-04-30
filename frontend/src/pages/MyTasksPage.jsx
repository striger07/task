import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import './MyTasksPage.css';

const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' }
];

export default function MyTasksPage() {
  const [filter, setFilter] = useState('all');
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.get('/tasks/my').then(r => r.data.data)
  });

  const updateTask = useMutation({
    mutationFn: ({ id, status }) => api.put(`/tasks/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries(['my-tasks']); qc.invalidateQueries(['dashboard']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const filtered = filter === 'all' ? tasks :
    filter === 'overdue' ? tasks.filter(t => t.isOverdue) :
    tasks.filter(t => t.status === filter);

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-header">
        <h1>My Tasks</h1>
        <div className="task-count">{tasks.length} total</div>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All <span>{tasks.length}</span>
        </button>
        {STATUSES.map(s => (
          <button key={s.key} className={`filter-tab ${filter === s.key ? 'active' : ''}`} onClick={() => setFilter(s.key)}>
            {s.label} <span>{tasks.filter(t => t.status === s.key).length}</span>
          </button>
        ))}
        <button className={`filter-tab overdue-tab ${filter === 'overdue' ? 'active' : ''}`} onClick={() => setFilter('overdue')}>
          Overdue <span>{tasks.filter(t => t.isOverdue).length}</span>
        </button>
      </div>

      {isLoading ? <div className="loading-spinner" /> : (
        <>
          {filtered.length === 0 ? (
            <div className="empty-tasks">
              <div className="empty-icon">✦</div>
              <h3>{filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}</h3>
              {filter === 'all' && <p>Tasks assigned to you will appear here</p>}
            </div>
          ) : (
            <div className="my-task-list">
              {filtered.map(task => (
                <div key={task._id} className={`my-task-item ${task.isOverdue ? 'overdue' : ''}`}>
                  <div className="my-task-left">
                    <div className="my-task-info">
                      <div className="my-task-title">{task.title}</div>
                      <div className="my-task-project">
                        <Link to={`/projects/${task.project._id}`} className="project-link">
                          {task.project.name}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="my-task-right">
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>

                    {task.dueDate && (
                      <span className={`due-chip ${task.isOverdue ? 'overdue' : ''}`}>
                        {task.isOverdue ? '⚠ Overdue · ' : ''}
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}

                    <select
                      className="status-pill"
                      value={task.status}
                      onChange={e => updateTask.mutate({ id: task._id, status: e.target.value })}
                    >
                      {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
