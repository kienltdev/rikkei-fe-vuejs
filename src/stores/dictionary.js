// src/stores/dictionary.js
import { defineStore } from 'pinia';
import dictionaryApi from '@/api/dictionary.js';

export const useDictionaryStore = defineStore('dictionary', {
  state: () => ({
    productTypes: [],
    supplierCodes: [],
    shippingMethods: [],
    isLoading: false,
  }),
  actions: {
    async fetchDictionaries() {
      if (this.productTypes.length > 0 && this.supplierCodes.length > 0 && this.shippingMethods.length > 0) {
        return;
      }

      this.isLoading = true;
      try {
        const [productTypesRes, supplierCodesRes, shippingMethodsRes] = await Promise.all([
          dictionaryApi.getProductTypes(),
          dictionaryApi.getSupplierCodes(),
          dictionaryApi.getShippingMethods() 
        ]);
        this.productTypes = productTypesRes.data.content;
        this.supplierCodes = supplierCodesRes.data.content;
        this.shippingMethods = shippingMethodsRes.data.content; 
      } catch (error) {
        console.error("Failed to fetch dictionaries:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});