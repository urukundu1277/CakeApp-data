import api from './api';

export const sliderService = {
  getAll: async () => {
    const response = await api.get('/sliders/admin');
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/sliders');
    return response.data;
  },

  create: async (formData) => {
    const response = await api.post('/sliders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id, formData) => {
    const response = await api.put(`/sliders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/sliders/${id}`);
    return response.data;
  },
};
