import React from 'react';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';

/** Accurate counts only: no demo data and no invented comparisons. */
export function StatsOverview({ tasks = [] }) {
  const active = tasks.filter(t => t.status !== 'CANCELLED');
  const today = new Date().toDateString();
  const dueToday = active.filter(t => t.dueDate && t.status !== 'COMPLETED'
    && new Date(t.dueDate).toDateString() === today).length;
  const inProgress = active.filter(t => t.status === 'IN_PROGRESS').length;
  const completed = active.filter(t => t.status === 'COMPLETED').length;
  const metrics = [
    { label: 'Due today', count: dueToday, icon: CalendarDays },
    { label: 'In progress', count: inProgress, icon: Clock3 },
    { label: 'Completed', count: completed, icon: CheckCircle2 },
  ];
  return (
    <section className="minimal-stats" aria-label="Task overview" id="workspace-progress">
      {metrics.map(({ label, count, icon: Icon }) => (
        <div className="minimal-stat" key={label}>
          <div className="minimal-stat-label"><Icon size={17} aria-hidden="true" /> {label}</div>
          <strong>{count}</strong>
        </div>
      ))}
    </section>
  );
}
