import api from './axios.js';

export const projectApi = {
  getProjects: async (params = {}) => {
    return api.get('/projects', { params });
  },

  getProject: async (id) => {
    return api.get(`/projects/${id}`);
  },

  createProject: async (data) => {
    return api.post('/projects', data);
  },

  updateProject: async (id, data) => {
    return api.patch(`/projects/${id}`, data);
  },

  deleteProject: async (id) => {
    return api.delete(`/projects/${id}`);
  },
};

