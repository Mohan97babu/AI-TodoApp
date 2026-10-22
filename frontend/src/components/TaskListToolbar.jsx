import React from 'react';
import { ArrowDownWideNarrow, ListTodo } from 'lucide-react';

export const SORT_OPTIONS = [
  { value: 'DUE_SOON', label: 'Due soon' },
  { value: 'PRIORITY', label: 'Priority first' },
  { value: 'NEWEST', label: 'Recently added' },
  { value: 'TITLE', label: 'Task name (A–Z)' },
];

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
