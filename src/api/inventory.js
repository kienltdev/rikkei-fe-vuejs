// src/api/inventory.js
import apiClient from './apiClient';

export default {
  /**
   * Lấy dữ liệu tóm tắt tồn kho
   * @param {object} params - Các tham số lọc (productType, supplierCd, invoice)
   * @returns {Promise<Object>}
   */
  getSummary(params) {
    return apiClient.get('/inventory/summary', { params });
  },

  /**
   * Lấy danh sách tồn kho chi tiết
   * @param {object} params - Các tham số lọc và phân trang
   * @returns {Promise<Object>}
   */
  getList(params) {
    return apiClient.get('/inventory/list', { params });
  }
};
