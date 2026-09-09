import api from './api';

export const announcementService = {
  getAll: async () => {
    const response = await api.get('/announcements/admin');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/announcements/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};
