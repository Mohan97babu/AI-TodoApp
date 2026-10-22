import React from 'react';
import { Home, ListTodo, Sparkles, Bot, Circle } from 'lucide-react';

/** Compact navigation. Every item opens an existing feature. */
export function WorkspaceSidebar({ activeView = 'overview', onNavigate, onOpenPlanner, onOpenAssistant, modelStatus, counts = {} }) {
  const items = [
    { id: 'overview', label: 'Dashboard', icon: Home, action: () => onNavigate('overview') },
    { id: 'tasks', label: 'My Tasks', icon: ListTodo, action: () => onNavigate('tasks') },
    { id: 'planner', label: 'Study Planner', icon: Sparkles, action: onOpenPlanner },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, action: onOpenAssistant },
  ];
  return (
    <aside className="workspace-sidebar" aria-label="Workspace">
      <div className="workspace-sidebar-label">WORKSPACE</div>
      <nav className="workspace-side-nav" aria-label="Main navigation">
        {items.map(({ id, label, icon: Icon, action }) => (
          <button key={id} type="button" onClick={action}
            className={`workspace-side-link ${activeView === id ? 'is-active' : ''}`}
            aria-current={activeView === id ? 'page' : undefined}>
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
            {id === 'tasks' && counts.all > 0 && <small className="workspace-side-count">{counts.all}</small>}
          </button>
        ))}
      </nav>
      <div className="workspace-sidebar-bottom">
        <div className="workspace-model-status" aria-live="polite">
          <Circle size={9} fill="currentColor" aria-hidden="true"
            className={modelStatus?.connected ? 'model-is-online' : 'model-is-offline'} />
          <span>{modelStatus === null ? 'Checking AI…' : modelStatus.connected ? 'AI model ready' : 'AI model offline'}</span>
        </div>
      </div>
    </aside>
  );
}
