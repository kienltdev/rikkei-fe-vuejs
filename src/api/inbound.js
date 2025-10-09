// src/api/inbound.js
import apiClient from './apiClient';

export default {
  getInbounds(params) {
    return apiClient.get('/inbounds', { params });
  },

  deleteInbound(id) {
    return apiClient.delete(`/inbounds/${id}`);
  },

  importInbounds(file) {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/inbounds/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
