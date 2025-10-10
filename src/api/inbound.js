// src/api/inbound.js
import apiClient from './apiClient';

export default {
  getInbounds(params) {
    return apiClient.get('/inbounds', { params });
  },
  getInboundDetail(id) {
    return apiClient.get(`/inbounds/${id}`);
  },
  createInbound(inboundData) {
    return apiClient.post('/inbounds', inboundData);
  },

  updateInbound(id, inboundData) {
    return apiClient.put(`/inbounds/${id}`, inboundData);
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
  },
  
  getStatistics(params) {
    return apiClient.get('/inbounds/statistics', { params });
  }
};
