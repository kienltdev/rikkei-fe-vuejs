// src/stores/dictionary.js
import { defineStore } from 'pinia';
import dictionaryApi from '@/api/dictionary.js';

export const useDictionaryStore = defineStore('dictionary', {
  state: () => ({
    productTypes: [],
    supplierCodes: [],
    isLoading: false,
  }),
  actions: {
    async fetchDictionaries() {
      if (this.productTypes.length > 0 && this.supplierCodes.length > 0) {
        return;
      }

      this.isLoading = true;
      try {
        const [productTypesRes, supplierCodesRes] = await Promise.all([
          dictionaryApi.getProductTypes(),
          dictionaryApi.getSupplierCodes()
        ]);
        this.productTypes = productTypesRes.data.content;
        this.supplierCodes = supplierCodesRes.data.content;
      } catch (error) {
        console.error("Failed to fetch dictionaries:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
