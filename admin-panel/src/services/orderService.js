import api from './api';

export const orderService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/admin/orders/${id}/status`, { orderStatus: status });
    return response.data;
  },
};
