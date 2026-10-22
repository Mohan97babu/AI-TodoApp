import React from 'react';
import { ArrowUpRight, Bot, CalendarDays, Sparkles } from 'lucide-react';

/** Calm, contextual start-of-day overview with clear primary actions. */
export function DashboardWelcome({ user, tasks = [], modelStatus, onOpenDevChatbot, onOpenPlanner }) {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || user?.username || 'there';
  const pending = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate).getTime() < now.getTime() && !['COMPLETED', 'CANCELLED'].includes(t.status)).length;

  return (
    <section className="dashboard-welcome" aria-label="Your daily overview">
      <div className="welcome-copy">
        <div className="welcome-date"><CalendarDays size={15} aria-hidden="true" /> {date}</div>
        <h1>Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, {firstName}.</h1>
        <p>{pending === 0 ? 'Everything is caught up. Plan your next win.' : `You have ${pending} open ${pending === 1 ? 'task' : 'tasks'}${overdue ? ` · ${overdue} overdue` : ''}. Make progress one step at a time.`}</p>
      </div>
      <div className="welcome-actions">
        <button type="button" className="btn-secondary" onClick={onOpenDevChatbot} title="Open Qwen assistant">
          <Bot size={17} aria-hidden="true" /> Ask Qwen
          <span className={`model-indicator ${modelStatus?.connected ? 'model-online' : 'model-offline'}`} aria-label={modelStatus?.connected ? 'Model connected' : 'Model offline'} />
        </button>
        <button type="button" className="btn-primary" onClick={onOpenPlanner}>
          <Sparkles size={17} aria-hidden="true" /> Create study plan <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
