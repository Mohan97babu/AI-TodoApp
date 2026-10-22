import React from 'react';
import confetti from 'canvas-confetti';
import { Check, Clock, Calendar, Repeat, Bell, Trash2, Edit2, AlertCircle } from 'lucide-react';

export function TaskCard({ task, onToggleStatus, onEdit, onDelete }) {
  const isCompleted = task.status === 'COMPLETED';

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextStatus = isCompleted ? 'PENDING' : 'COMPLETED';
    
    if (nextStatus === 'COMPLETED' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#EB1000', '#FF4D4D', '#FFFFFF', '#FF8577']
      });
    }
    
    onToggleStatus(task.id, nextStatus);
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isPast = d < now && !isCompleted;

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return {
      text: isToday ? `Today at ${timeStr}` : `${dateFormatted}, ${timeStr}`,
      isPast,
      isToday,
    };
  };

  const dueInfo = formatDueDate(task.dueDate);

  const getPriorityClass = (prio) => {
    switch (prio) {
      case 'URGENT': return 'prio-urgent';
      case 'HIGH': return 'prio-high';
      case 'MEDIUM': return 'prio-medium';
      case 'LOW': default: return 'prio-low';
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition)',
        position: 'relative',
        opacity: isCompleted ? 0.85 : 1,
      }}

    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        aria-label={isCompleted ? `Mark ${task.title} as pending` : `Complete ${task.title}`}
        aria-pressed={isCompleted}
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '6px',
          border: isCompleted ? 'none' : '2px solid var(--border-active)',
          backgroundColor: isCompleted ? 'var(--adobe-red)' : 'transparent',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '2px',
          flexShrink: 0,
          transition: 'var(--transition)',
        }}
      >
        {isCompleted && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
          <h4 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: isCompleted ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </h4>

          {/* Priority Badge */}
          <span className={`tag-badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>

          {/* Category */}
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-canvas)',
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            {task.category}
          </span>
        </div>

        {task.description && (
          <p style={{
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem',
            lineHeight: 1.4,
          }}>
            {task.description}
          </p>
        )}

        {/* Metadata row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
          {dueInfo && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: dueInfo.isPast ? 'var(--color-urgent)' : dueInfo.isToday ? 'var(--adobe-red)' : 'var(--text-secondary)',
              fontWeight: dueInfo.isPast || dueInfo.isToday ? 600 : 500,
            }}>
              {dueInfo.isPast ? <AlertCircle size={13} /> : <Calendar size={13} />}
              <span>{dueInfo.text}</span>
            </div>
          )}

          {task.isRecurring && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--adobe-red)', fontWeight: 600 }}>
              <Repeat size={12} />
              <span>Repeats {task.recurrenceInterval?.toLowerCase()}</span>
            </div>
          )}

          {task.reminders && task.reminders.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
              <Bell size={12} color="var(--adobe-red)" />
              <span>Reminder set</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button
          onClick={() => onEdit(task)}
          className="btn-ghost"
          style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
          title="Edit Task"
          aria-label={`Edit ${task.title}`}
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn-ghost"
          style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
          title="Delete Task"
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
