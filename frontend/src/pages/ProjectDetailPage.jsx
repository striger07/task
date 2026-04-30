import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskCard from '../components/tasks/TaskCard';
import './ProjectDetailPage.css';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#5a6480' },
  { key: 'in-progress', label: 'In Progress', color: '#38bdf8' },
  { key: 'review', label: 'Review', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#22c55e' },
];

const emptyTask = { title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data.data)
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', id, filterStatus],
    queryFn: () => api.get(`/tasks/project/${id}${filterStatus ? `?status=${filterStatus}` : ''}`).then(r => r.data.data)
  });

  const createTask = useMutation({
    mutationFn: (data) => api.post('/tasks', { ...data, project: id }),
    onSuccess: () => { qc.invalidateQueries(['tasks', id]); toast.success('Task created!'); setShowTaskModal(false); setTaskForm(emptyTask); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, data }) => api.put(`/tasks/${taskId}`, data),
    onSuccess: () => { qc.invalidateQueries(['tasks', id]); qc.invalidateQueries(['dashboard']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const deleteTask = useMutation({
    mutationFn: (taskId) => api.delete(`/tasks/${taskId}`),
    onSuccess: () => { qc.invalidateQueries(['tasks', id]); toast.success('Task deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const addMember = useMutation({
    mutationFn: () => api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole }),
    onSuccess: () => { qc.invalidateQueries(['project', id]); toast.success('Member added!'); setShowMemberModal(false); setMemberEmail(''); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const removeMember = useMutation({
    mutationFn: (userId) => api.delete(`/projects/${id}/members/${userId}`),
    onSuccess: () => { qc.invalidateQueries(['project', id]); toast.success('Member removed'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  if (loadingProject) return <div className="loading-spinner" />;
  if (!project) return <div>Project not found</div>;

  const myRole = project.members.find(m => m.user._id === user._id)?.role;
  const isAdmin = myRole === 'Admin';

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const payload = { ...taskForm };
    if (!payload.dueDate) delete payload.dueDate;
    if (!payload.assignedTo) delete payload.assignedTo;
    if (editingTask) {
      updateTask.mutate({ taskId: editingTask._id, data: payload });
      setEditingTask(null);
      setShowTaskModal(false);
      setTaskForm(emptyTask);
    } else {
      createTask.mutate(payload);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      assignedTo: task.assignedTo?._id || ''
    });
    setShowTaskModal(true);
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask.mutate({ taskId, data: { status: newStatus } });
  };

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="project-detail">
      <div className="detail-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/projects')}>← Projects</button>
          <h1>{project.name}</h1>
          {project.description && <p className="project-desc-text">{project.description}</p>}
        </div>
        <div className="header-actions">
          {isAdmin && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(true)}>
                + Member
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingTask(null); setTaskForm(emptyTask); setShowTaskModal(true); }}>
                + Task
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-tabs">
        {['board', 'list', 'members'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loadingTasks ? <div className="loading-spinner" /> : (
        <>
          {tab === 'board' && (
            <div className="kanban-board">
              {COLUMNS.map(col => (
                <div key={col.key} className="kanban-col">
                  <div className="kanban-col-header">
                    <div className="col-dot" style={{ background: col.color }} />
                    <span className="col-title">{col.label}</span>
                    <span className="col-count">{tasksByStatus(col.key).length}</span>
                  </div>
                  <div className="kanban-cards">
                    {tasksByStatus(col.key).map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        isAdmin={isAdmin}
                        currentUserId={user._id}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={(tid) => deleteTask.mutate(tid)}
                        columns={COLUMNS}
                      />
                    ))}
                    {isAdmin && (
                      <button
                        className="add-task-btn"
                        onClick={() => { setEditingTask(null); setTaskForm({ ...emptyTask, status: col.key }); setShowTaskModal(true); }}
                      >
                        + Add task
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'list' && (
            <div className="task-list-view">
              <div className="list-filters">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              {tasks.length === 0 ? (
                <div className="empty-state-sm">No tasks found</div>
              ) : (
                <div className="task-list">
                  {tasks.map(task => (
                    <div key={task._id} className="task-list-item">
                      <div className="task-list-left">
                        <select
                          className="status-select"
                          value={task.status}
                          onChange={e => handleStatusChange(task._id, e.target.value)}
                          disabled={myRole !== 'Admin' && task.assignedTo?._id !== user._id}
                        >
                          {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                        <div>
                          <div className="task-list-title">{task.title}</div>
                          {task.assignedTo && (
                            <div className="task-list-meta">Assigned to {task.assignedTo.name}</div>
                          )}
                        </div>
                      </div>
                      <div className="task-list-right">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span className={`due-date ${task.isOverdue ? 'overdue' : ''}`}>
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                        {isAdmin && (
                          <div className="task-list-actions">
                            <button className="icon-btn" onClick={() => handleEditTask(task)}>✎</button>
                            <button className="icon-btn danger" onClick={() => deleteTask.mutate(task._id)}>✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'members' && (
            <div className="members-view">
              {project.members.map(m => (
                <div key={m.user._id} className="member-row">
                  <div className="member-info">
                    <div className="member-av">{m.user.name[0].toUpperCase()}</div>
                    <div>
                      <div className="member-name">{m.user.name}</div>
                      <div className="member-email-text">{m.user.email}</div>
                    </div>
                  </div>
                  <div className="member-row-right">
                    <span className={`role-badge ${m.role === 'Admin' ? 'admin' : 'member'}`}>{m.role}</span>
                    {isAdmin && project.owner._id !== m.user._id && m.user._id !== user._id && (
                      <button className="btn btn-danger btn-sm" onClick={() => removeMember.mutate(m.user._id)}>Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setEditingTask(null); }} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleTaskSubmit} className="modal-form">
          <div className="form-group">
            <label>Title *</label>
            <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="Task title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={3} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Details..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Assign To</label>
            <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {project.members.map(m => <option key={m.user._id} value={m.user._id}>{m.user.name}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => { setShowTaskModal(false); setEditingTask(null); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createTask.isPending || updateTask.isPending}>
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <div className="modal-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="user@example.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={memberRole} onChange={e => setMemberRole(e.target.value)}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => addMember.mutate()} disabled={!memberEmail || addMember.isPending}>
              {addMember.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
