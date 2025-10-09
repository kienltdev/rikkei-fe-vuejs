// src/api/inventory.js
import apiClient from './apiClient';

export default {
  /**
   * Lấy dữ liệu tóm tắt tồn kho
   * @returns {Promise<Object>} Promise chứa dữ liệu summary
   */
  getSummary() {
    // Interceptor sẽ tự động thêm header Authorization
    return apiClient.get('/inventory/summary');
  }
};
