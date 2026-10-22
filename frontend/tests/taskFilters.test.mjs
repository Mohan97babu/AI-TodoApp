import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTasks } from '../src/utils/taskFilters.js';

const tasks = [
  { id: 1, title: 'Prepare Spring Boot API', description: 'Study Java', category: 'WORK', status: 'PENDING' },
  { id: 2, title: 'Read CSS', description: null, category: 'STUDY', status: 'COMPLETED' },
  { id: 3, title: 'Review database', description: 'PostgreSQL setup', category: 'WORK', status: 'IN_PROGRESS' },
];

test('switching filters leaves source tasks intact and preserves totals', () => {
  const original = JSON.stringify(tasks);
  assert.deepEqual(filterTasks(tasks, { status: 'COMPLETED' }).map(t => t.id), [2]);
  assert.equal(tasks.length, 3);
  assert.equal(JSON.stringify(tasks), original);
});
test('category and keyword can be combined', () => {
  assert.deepEqual(filterTasks(tasks, { category: 'work', search: 'spring' }).map(t => t.id), [1]);
});
test('search finds descriptions and ignores case', () => {
  assert.deepEqual(filterTasks(tasks, { search: 'postgres' }).map(t => t.id), [3]);
});
test('no filters return all tasks', () => {
  assert.equal(filterTasks(tasks).length, 3);
});
