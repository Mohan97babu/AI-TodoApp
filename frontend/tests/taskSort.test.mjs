import test from 'node:test';
import assert from 'node:assert/strict';
import { sortTasks } from '../src/utils/taskSort.js';

const tasks = [
  { id: 1, title: 'Later', priority: 'LOW', status: 'PENDING', dueDate: '2026-11-10T10:00:00Z', createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, title: 'Soon', priority: 'URGENT', status: 'IN_PROGRESS', dueDate: '2026-11-01T10:00:00Z', createdAt: '2026-01-03T00:00:00Z' },
  { id: 3, title: 'Done', priority: 'URGENT', status: 'COMPLETED', dueDate: '2026-10-01T10:00:00Z', createdAt: '2026-01-04T00:00:00Z' },
  { id: 4, title: 'Undated', priority: 'MEDIUM', status: 'PENDING', createdAt: '2026-01-02T00:00:00Z' },
];

test('due-soon ordering puts incomplete tasks first and undated tasks last', () => {
  assert.deepEqual(sortTasks(tasks, 'DUE_SOON').map(t => t.id), [2, 1, 4, 3]);
});

test('priority ordering is urgent to low while completed tasks remain last', () => {
  assert.deepEqual(sortTasks(tasks, 'PRIORITY').map(t => t.id), [2, 4, 1, 3]);
});

test('newest ordering sorts by createdAt and keeps completed tasks last', () => {
  assert.deepEqual(sortTasks(tasks, 'NEWEST').map(t => t.id), [2, 4, 1, 3]);
});

test('alphabetical ordering and immutability', () => {
  const source = [...tasks];
  assert.deepEqual(sortTasks(tasks, 'TITLE').map(t => t.title), ['Later', 'Soon', 'Undated', 'Done']);
  assert.deepEqual(tasks, source);
});

test('empty list does not fail', () => {
  assert.deepEqual(sortTasks([], 'DUE_SOON'), []);
});
