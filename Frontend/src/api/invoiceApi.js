import api from './axios.js';

export const invoiceApi = {
  getInvoices: async (params = {}) => {
    return api.get('/invoices', { params });
  },

  getInvoice: async (id) => {
    return api.get(`/invoices/${id}`);
  },

  createInvoice: async (data) => {
    return api.post('/invoices', data);
  },

  updateStatus: async (id, status) => {
    return api.patch(`/invoices/${id}/status`, { status });
  },

  deleteInvoice: async (id) => {
    return api.delete(`/invoices/${id}`);
  },
};

