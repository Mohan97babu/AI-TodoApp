import React from 'react';
import { ArrowRight, CalendarDays, Bot, Plus, Sparkles } from 'lucide-react';
import heroStudy from '../assets/hero-study.svg';

export function DashboardWelcome({ user, tasks = [], modelStatus, onOpenDevChatbot, onOpenPlanner, onAddTask }) {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || user?.username || 'there';
  const pending = tasks.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status)).length;
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="workspace-hero" aria-label="Daily welcome">
      <img src={heroStudy} className="workspace-hero-art" alt="" aria-hidden="true" />
      <div className="workspace-hero-content">
        <div className="workspace-eyebrow"><CalendarDays size={14} aria-hidden="true" /> {date}</div>
        <h1>{greeting}, <span>{firstName}!</span> <span aria-hidden="true">👋</span></h1>
        <p>{pending ? `You have ${pending} open ${pending === 1 ? 'task' : 'tasks'}. Let's make today count.` : 'A fresh start, a clear mind, and room for your next big idea.'}</p>
        <div className="workspace-hero-quote">A little progress every day adds up to big results.</div>
        <div className="workspace-hero-actions">
          <button className="btn-primary" type="button" onClick={onAddTask}><Plus size={18} aria-hidden="true" /> Add task</button>
          <button className="workspace-hero-secondary" type="button" onClick={onOpenPlanner}><Sparkles size={17} aria-hidden="true" /> Create study plan</button>
          <button className="workspace-hero-secondary is-ai" type="button" onClick={onOpenDevChatbot}><Bot size={18} aria-hidden="true" /> Ask AI assistant <span className={`model-indicator ${modelStatus?.connected ? 'model-online' : 'model-offline'}`} /></button>
        </div>
      </div>
    </section>
  );
}
