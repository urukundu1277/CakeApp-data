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

  cancelOrder: async (id, cancellationReason) => {
    const response = await api.put(`/admin/orders/${id}/cancel`, { cancellationReason });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/orders/stats');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/orders/${id}`);
    return response.data;
  },
};
