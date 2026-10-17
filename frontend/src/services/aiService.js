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

  async chatCoach(message) {
    return await apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
