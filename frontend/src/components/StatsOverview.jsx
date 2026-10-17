import React from 'react';
import { CheckCircle2, Clock, Calendar, Flame, BookOpen } from 'lucide-react';

export function StatsOverview({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pending = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  const now = new Date();
  const todayCount = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.toDateString() === now.toDateString();
  }).length;

  const studyTasksCount = tasks.filter((t) => t.category === 'STUDY').length;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    }}>
      {/* Overall Progress Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.15rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DAILY MOMENTUM</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--adobe-red)' }}>{percentage}%</span>
        </div>
        <div style={{
          height: '8px',
          width: '100%',
          backgroundColor: 'var(--bg-canvas)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: '0.5rem'
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #EB1000 0%, #FF5A4D 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease'
          }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {completed} of {total} completed • {pending} remaining
        </p>
      </div>

      {/* Due Today */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.15rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(235, 16, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--adobe-red)'
        }}>
          <Calendar size={22} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DUE TODAY</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{todayCount}</h3>
        </div>
      </div>

      {/* In-Flight / Pending */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.15rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(38, 128, 235, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#389BFF'
        }}>
          <Clock size={22} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PENDING TASKS</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{pending}</h3>
        </div>
      </div>

      {/* AI Study Plans */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.15rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(38, 179, 104, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-success)'
        }}>
          <BookOpen size={22} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>STUDY MODULES</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{studyTasksCount}</h3>
        </div>
      </div>
    </div>
  );
}
