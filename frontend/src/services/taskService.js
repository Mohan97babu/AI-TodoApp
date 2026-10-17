import { apiRequest } from './api';

export const taskService = {
  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    if (filters.category && filters.category !== 'ALL') {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/tasks${query}`);
  },

  async createTask(taskData) {
    return await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(id, taskData) {
    return await apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  async updateStatus(id, status) {
    return await apiRequest(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteTask(id) {
    return await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async batchCreateTasks(tasks, studyPlanId = null) {
    return await apiRequest('/tasks/batch', {
      method: 'POST',
      body: JSON.stringify({
        studyPlanId,
        tasks,
      }),
    });
  },
};
