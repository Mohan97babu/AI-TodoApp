import React from 'react';
import { Home, ListTodo, Sparkles, Bot, CheckCircle2, BarChart3, BookOpen, Activity } from 'lucide-react';

/** Real navigation only: every entry opens a working feature or an existing view. */
export function WorkspaceSidebar({ activeView = 'overview', onNavigate, onOpenPlanner, onOpenAssistant, modelStatus, counts = {} }) {
  const items = [
    { id: 'overview', label: 'Dashboard', Icon: Home, onClick: () => onNavigate('overview') },
    { id: 'tasks', label: 'My Tasks', Icon: ListTodo, onClick: () => onNavigate('tasks') },
    { id: 'planner', label: 'Study Planner', Icon: Sparkles, onClick: onOpenPlanner },
    { id: 'assistant', label: 'AI Dev Assistant', Icon: Bot, onClick: onOpenAssistant },
    { id: 'completed', label: 'Completed', Icon: CheckCircle2, onClick: () => onNavigate('completed') },
    { id: 'progress', label: 'My Progress', Icon: BarChart3, onClick: () => onNavigate('progress') },
  ];

  return (
    <aside className="workspace-sidebar" aria-label="Workspace navigation">
      <div className="workspace-sidebar-label">WORKSPACE</div>
      <nav className="workspace-side-nav" aria-label="Main navigation">
        {items.map(({ id, label, Icon, onClick }) => (
          <button
            key={id}
            type="button"
            className={`workspace-side-link ${activeView === id ? 'is-active' : ''}`}
            aria-current={activeView === id ? 'page' : undefined}
            onClick={onClick}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
            {id === 'tasks' && <small className="workspace-side-count">{counts.all ?? 0}</small>}
          </button>
        ))}
      </nav>
      <div className="workspace-sidebar-bottom">
        <div className="workspace-status-card">
          <div className="workspace-status-heading"><BookOpen size={17} aria-hidden="true" /> Your study companion</div>
          <p>Break big goals into small, achievable steps.</p>
          <button type="button" onClick={onOpenPlanner}>Create a study plan <span aria-hidden="true">↗</span></button>
        </div>
        <div className="workspace-model-status" aria-live="polite">
          <Activity size={15} aria-hidden="true" />
          <span className={modelStatus?.connected ? 'is-online' : ''}>{modelStatus?.connected ? 'Qwen AI connected' : 'Qwen AI unavailable'}</span>
        </div>
      </div>
    </aside>
  );
}
