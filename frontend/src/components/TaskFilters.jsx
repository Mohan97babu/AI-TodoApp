import React from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['ALL', 'WORK', 'STUDY', 'PERSONAL', 'HEALTH', 'GENERAL'];

export function TaskFilters({
  activeStatus, onStatusChange, activeCategory, onCategoryChange,
  searchQuery, onSearchChange, counts = {}
}) {
  const statuses = [
    { key: 'ALL', label: 'All', count: counts.all ?? 0 },
    { key: 'PENDING', label: 'Pending', count: counts.pending ?? 0 },
    { key: 'IN_PROGRESS', label: 'In progress', count: counts.inProgress ?? 0 },
    { key: 'COMPLETED', label: 'Completed', count: counts.completed ?? 0 },
  ];
  const hasFilters = activeStatus !== 'ALL' || activeCategory !== 'ALL' || !!searchQuery;
  return (
    <div className="minimal-task-filters">
      <div className="minimal-status-tabs" role="group" aria-label="Filter tasks by status">
        {statuses.map(s => (
          <button key={s.key} type="button" onClick={() => onStatusChange(s.key)}
            className={activeStatus === s.key ? 'is-active' : ''}
            aria-pressed={activeStatus === s.key}>
            {s.label} <span>{s.count}</span>
          </button>
        ))}
      </div>
      <div className="minimal-filter-extras">
        <label className="minimal-filter-category">
          <span>Category</span>
          <select aria-label="Filter by category" value={activeCategory}
            onChange={e => onCategoryChange(e.target.value)}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat === 'ALL' ? 'All categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}</option>)}
          </select>
        </label>
        {hasFilters && <button type="button" className="minimal-clear-filters"
          onClick={() => { onStatusChange('ALL'); onCategoryChange('ALL'); onSearchChange(''); }}>
          <X size={14} aria-hidden="true" /> Clear
        </button>}
      </div>
    </div>
  );
}
