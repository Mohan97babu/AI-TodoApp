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
      case 'NEWEST': {
        const timestamp = item => {
          const parsed = Date.parse(item.createdAt || '');
          return Number.isFinite(parsed) ? parsed : 0;
        };
        return timestamp(b) - timestamp(a);
      }
      case 'TITLE':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return date(a.dueDate) - date(b.dueDate)
          || (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
    }
  });
}
