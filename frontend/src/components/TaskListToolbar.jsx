import React from 'react';
import { ArrowDownWideNarrow, ListTodo } from 'lucide-react';

export const SORT_OPTIONS = [
  { value: 'DUE_SOON', label: 'Due soon' },
  { value: 'PRIORITY', label: 'Priority first' },
  { value: 'NEWEST', label: 'Recently added' },
  { value: 'TITLE', label: 'Task name (A–Z)' },
];

const PRIORITY_ORDER = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export function sortTasks(tasks = [], sortBy = 'DUE_SOON') {
  const date = value => {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : Infinity;
  };
  return [...tasks].sort((a, b) => {
    const doneA = a.status === 'COMPLETED' || a.status === 'CANCELLED' ? 1 : 0;
    const doneB = b.status === 'COMPLETED' || b.status === 'CANCELLED' ? 1 : 0;
    if (doneA !== doneB) return doneA - doneB;
    switch (sortBy) {
      case 'PRIORITY':
        return (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)
          || date(a.dueDate) - date(b.dueDate);
      case 'NEWEST':
        return (Number.isFinite(Date.parse(b.createdAt)) ? Date.parse(b.createdAt) : 0)
          - (Number.isFinite(Date.parse(a.createdAt)) ? Date.parse(a.createdAt) : 0);
      case 'TITLE':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return date(a.dueDate) - date(b.dueDate)
          || (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
    }
  });
}

export function TaskListToolbar({ count, sortBy, onSortChange }) {
  return (
    <div className="task-list-toolbar">
      <div className="task-list-heading">
        <ListTodo size={20} aria-hidden="true" />
        <div>
          <h2>My tasks</h2>
          <p>{count} {count === 1 ? 'task' : 'tasks'} in this view</p>
        </div>
      </div>
      <label className="task-sort-label">
        <ArrowDownWideNarrow size={16} aria-hidden="true" />
        <span>Sort by</span>
        <select aria-label="Sort tasks" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          {SORT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
    </div>
  );
}
