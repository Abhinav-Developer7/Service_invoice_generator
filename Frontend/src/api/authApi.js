import api from './axios.js';

export const authApi = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  logout: async () => {
    return api.post('/auth/logout');
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  seedAdmin: async () => {
    return api.post('/auth/seed');
  },
};

