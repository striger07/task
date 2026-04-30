import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', deadline: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/projects', data),
    onSuccess: () => {
      qc.invalidateQueries(['projects']);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '', deadline: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create project')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => { qc.invalidateQueries(['projects']); toast.success('Project deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this project and all its tasks?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {isLoading ? <div className="loading-spinner" /> : (
        <>
          {data?.length === 0 ? (
            <div className="empty-projects">
              <div className="empty-icon">◫</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
            </div>
          ) : (
            <div className="projects-grid">
              {data?.map(project => {
                const myRole = project.members.find(m => m.user._id === user._id)?.role;
                return (
                  <Link to={`/projects/${project._id}`} key={project._id} className="project-card">
                    <div className="project-card-header">
                      <div className="project-icon">{project.name[0].toUpperCase()}</div>
                      <div className="project-actions">
                        <span className={`badge ${project.status === 'active' ? 'badge-in-progress' : 'badge-done'}`}>
                          {project.status}
                        </span>
                        {project.owner._id === user._id && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={(e) => handleDelete(e, project._id)}
                          >✕</button>
                        )}
                      </div>
                    </div>
                    <h3 className="project-name">{project.name}</h3>
                    {project.description && (
                      <p className="project-desc">{project.description}</p>
                    )}
                    <div className="project-meta">
                      <div className="project-members">
                        {project.members.slice(0, 4).map(m => (
                          <div key={m.user._id} className="member-avatar" title={m.user.name}>
                            {m.user.name[0].toUpperCase()}
                          </div>
                        ))}
                        {project.members.length > 4 && (
                          <div className="member-more">+{project.members.length - 4}</div>
                        )}
                      </div>
                      <div className="project-info-row">
                        {myRole && <span className={`role-badge ${myRole === 'Admin' ? 'admin' : 'member'}`}>{myRole}</span>}
                        {project.deadline && (
                          <span className="project-deadline">
                            Due {format(new Date(project.deadline), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Project">
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Project Name *</label>
            <input
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              placeholder="What's this project about?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
