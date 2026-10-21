import { apiRequest } from './api';

export const aiService = {
  async generateStudyPlan(topic, durationDays = 7, dailyHours = 2, skillLevel = 'BEGINNER') {
    return await apiRequest('/ai/study-plan', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        durationDays: parseInt(durationDays, 10),
        dailyHours: parseFloat(dailyHours),
        skillLevel,
      }),
    });
  },

  async chatCoach(message, history = [], sourcesEnabled = null, mode = 'dev') {
    return await apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history,
        sourcesEnabled: sourcesEnabled || {
          geeksforgeeks: true,
          w3schools: true,
          tpointtech: true,
        },
        mode,
      }),
    });
  },

  async getModelStatus() {
    return await apiRequest('/ai/model-status', {
      method: 'GET',
    });
  },

  async searchWebKnowledge(query) {
    const encoded = encodeURIComponent(query || '');
    return await apiRequest(`/ai/knowledge/search?q=${encoded}`, {
      method: 'GET',
    });
  },
};
