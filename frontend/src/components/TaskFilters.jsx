import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export function TaskFilters({
  activeStatus,
  onStatusChange,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  counts = {},
}) {
  const statuses = [
    { key: 'ALL', label: 'All Tasks', count: counts.all ?? 0 },
    { key: 'PENDING', label: 'Pending', count: counts.pending ?? 0 },
    { key: 'IN_PROGRESS', label: 'In Progress', count: counts.inProgress ?? 0 },
    { key: 'COMPLETED', label: 'Completed', count: counts.completed ?? 0 },
  ];

  const categories = ['ALL', 'WORK', 'STUDY', 'PERSONAL', 'HEALTH', 'GENERAL'];

  return (
    <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        {/* Status Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '0.25rem',
          overflowX: 'auto',
        }}>
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => onStatusChange(s.key)}
              aria-pressed={activeStatus === s.key}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: activeStatus === s.key ? 'var(--adobe-red)' : 'transparent',
                color: activeStatus === s.key ? '#FFFFFF' : 'var(--text-secondary)',
                boxShadow: activeStatus === s.key ? 'var(--shadow-red)' : 'none',
              }}
            >
              <span>{s.label}</span>
              <span style={{
                fontSize: '0.7rem',
                opacity: 0.85,
                marginLeft: '0.25rem',
                padding: '0.05rem 0.35rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeStatus === s.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-canvas)'
              }}>
                {s.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="task-filter-search" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '0.35rem 0.85rem',
          width: '100%',
          maxWidth: '260px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.825rem',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              style={{ padding: 0, color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {(activeStatus !== 'ALL' || activeCategory !== 'ALL' || searchQuery) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => { onStatusChange('ALL'); onCategoryChange('ALL'); onSearchChange(''); }}>
            <X size={14} aria-hidden="true" /> Clear all filters
          </button>
        </div>
      )}

      {/* Category Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
          CATEGORY:
        </span>
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              aria-pressed={isSelected}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                border: isSelected ? '1px solid var(--adobe-red)' : '1px solid var(--border-subtle)',
                color: isSelected ? 'var(--adobe-red)' : 'var(--text-secondary)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
