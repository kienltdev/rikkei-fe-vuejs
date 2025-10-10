import apiClient from './apiClient';

export default {
  /**
   * Lấy báo cáo tồn kho hàng tháng theo năm
   * @param {number} year - Năm cần xem báo cáo
   * @returns {Promise<Object>}
   */
  getMonthlyInventoryReport(year) {
    return apiClient.get('/reports/monthly-inventory', {
      params: { year }
    });
  }
};