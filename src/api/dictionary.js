import apiClient from './apiClient';

export default {
  getProductTypes() {
    return apiClient.get('/product-types');
  },
  getSupplierCodes() {
    return apiClient.get('/supplier-codes');
  }
};
