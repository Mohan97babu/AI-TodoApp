/**
 * Filter the loaded task collection without changing the source array.
 * Keeping the full list in memory also keeps dashboard totals stable
 * while users switch task-list filters.
 */
export function filterTasks(tasks = [], { status = 'ALL', category = 'ALL', search = '' } = {}) {
  const keyword = search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (status !== 'ALL' && task.status !== status) return false;
    if (category !== 'ALL' && (task.category || '').toUpperCase() !== category.toUpperCase()) return false;
    if (!keyword) return true;
    return [task.title, task.description].some((field) => (field || '').toLowerCase().includes(keyword));
  });
}
