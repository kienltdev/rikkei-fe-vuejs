// src/api/outbound.js
import apiClient from './apiClient';

export default {
  /**
   * Lấy danh sách phiếu xuất kho có phân trang.
   * @param {object} params - Các tham số cho query string (page, size).
   * @returns {Promise<Object>}
   */
  getOutbounds(params) {
    return apiClient.get('/outbounds', { params });
  },

  getOutboundDetail(id) {
    return apiClient.get(`/outbounds/${id}`);
  },

  updateOutbound(id, outboundData) {
    return apiClient.put(`/outbounds/${id}`, outboundData);
  },

  deleteOutbound(id) {
    return apiClient.delete(`/outbounds/${id}`);
  },

  createOutbound(outboundData) {
    return apiClient.post('/outbounds', outboundData);
  }
  
};