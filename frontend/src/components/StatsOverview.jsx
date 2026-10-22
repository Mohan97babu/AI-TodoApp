import React from 'react';
import { Calendar, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

/** All numbers are derived from the signed-in user's actual tasks. */
export function StatsOverview({ tasks = [] }) {
  const active = tasks.filter(t => t.status !== 'CANCELLED');
  const total = active.length;
  const completed = active.filter(t => t.status === 'COMPLETED').length;
  const inProgress = active.filter(t => t.status === 'IN_PROGRESS').length;
  const pending = total - completed;
  const percentage = total ? Math.round(completed / total * 100) : 0;
  const today = new Date();
  const dueToday = active.filter(t => t.dueDate && t.status !== 'COMPLETED' && new Date(t.dueDate).toDateString() === today.toDateString()).length;

  return (
    <section className="workspace-stats" aria-label="Your task progress">
      <div className="workspace-stat workspace-stat-progress" id="workspace-progress">
        <div className="workspace-progress-ring" role="img" aria-label={`${percentage}% of active tasks completed`}
          style={{ '--progress-angle': `${percentage * 3.6}deg` }}>
          <div>{percentage}%</div>
        </div>
        <div className="workspace-stat-content">
          <span className="workspace-stat-title">Overall progress</span>
          <strong>{completed} of {total}</strong>
          <small>{total ? 'tasks completed' : 'Add tasks to get started'}</small>
        </div>
      </div>
      <div className="workspace-stat">
        <div className="workspace-stat-icon is-red"><Calendar size={21} aria-hidden="true" /></div>
        <div className="workspace-stat-content"><span className="workspace-stat-title">Due today</span><strong>{dueToday}</strong><small>{dueToday ? 'tasks need your attention' : 'Nothing due right now'}</small></div>
      </div>
      <div className="workspace-stat">
        <div className="workspace-stat-icon is-blue"><Clock size={21} aria-hidden="true" /></div>
        <div className="workspace-stat-content"><span className="workspace-stat-title">In progress</span><strong>{inProgress}</strong><small>{pending ? `${pending} tasks still open` : 'You are all caught up'}</small></div>
      </div>
      <div className="workspace-stat">
        <div className="workspace-stat-icon is-green"><CheckCircle2 size={21} aria-hidden="true" /></div>
        <div className="workspace-stat-content"><span className="workspace-stat-title">Completed</span><strong>{completed}</strong><small><TrendingUp size={12} aria-hidden="true" /> All-time completed</small></div>
      </div>
    </section>
  );
}
