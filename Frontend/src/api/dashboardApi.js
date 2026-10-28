import api from './axios.js';

export const dashboardApi = {
  getSummary: async () => {
    return api.get('/dashboard/summary');
  },
};

