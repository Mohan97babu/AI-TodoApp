import React from 'react';
import { CalendarDays, Plus } from 'lucide-react';

/** Deliberately lightweight: the task list, not a marketing banner, is the focus. */
export function DashboardWelcome({ user, tasks = [], onAddTask }) {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || user?.username || 'there';
  const open = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const message = open === 0 ? "You're all caught up. Add something when you're ready." :
    `You have ${open} ${open === 1 ? 'task' : 'tasks'} to focus on.`;
  return (
    <section className="minimal-welcome" aria-label="Daily welcome">
      <div className="minimal-welcome-copy">
        <div className="welcome-date"><CalendarDays size={15} aria-hidden="true" /> {date}</div>
        <h1>Welcome back, {firstName} <span aria-hidden="true">👋</span></h1>
        <p>{message}</p>
      </div>
      <button className="btn-primary minimal-welcome-add" type="button" onClick={onAddTask}>
        <Plus size={17} aria-hidden="true" /> New task
      </button>
    </section>
  );
}
