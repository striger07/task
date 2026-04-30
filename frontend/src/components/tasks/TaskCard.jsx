import { format } from 'date-fns';
import './TaskCard.css';

export default function TaskCard({ task, isAdmin, currentUserId, onStatusChange, onEdit, onDelete, columns }) {
  const canEdit = isAdmin || task.assignedTo?._id === currentUserId;

  return (
    <div className={`task-card ${task.isOverdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {(isAdmin || task.createdBy?._id === currentUserId) && (
          <div className="task-card-actions">
            {isAdmin && <button className="icon-btn" onClick={() => onEdit(task)}>✎</button>}
            {(isAdmin || task.createdBy?._id === currentUserId) && (
              <button className="icon-btn danger" onClick={() => onDelete(task._id)}>✕</button>
            )}
          </div>
        )}
      </div>

      <div className="task-card-title">{task.title}</div>

      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}

      <div className="task-card-footer">
        {task.assignedTo && (
          <div className="task-assignee" title={task.assignedTo.name}>
            {task.assignedTo.name[0].toUpperCase()}
          </div>
        )}
        {task.dueDate && (
          <span className={`task-due ${task.isOverdue ? 'overdue-text' : ''}`}>
            {task.isOverdue ? '⚠ ' : ''}
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>

      {canEdit && (
        <select
          className="task-status-select"
          value={task.status}
          onChange={e => onStatusChange(task._id, e.target.value)}
        >
          {columns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      )}
    </div>
  );
}
