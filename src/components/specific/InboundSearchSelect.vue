<script setup>
import { ref, watch, computed } from 'vue';
import inboundApi from '@/api/inbound.js';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';

// --- Props & Emits ---
const props = defineProps({
  modelValue: { type: [Number, String], default: '' },
  error: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue', 'inbound-selected']);

// --- State ---
const searchTerm = ref('');
const searchResults = ref([]);
const selectedInbound = ref(null);
const isLoading = ref(false);
const searchError = ref('');
const debounceTimer = ref(null);

// --- Dictionary Store for mapping codes to names ---
const dictionaryStore = useDictionaryStore();
// Lấy state ra một cách an toàn ở top-level
const { productTypes, supplierCodes } = storeToRefs(dictionaryStore);

// Tạo map một cách an toàn
const productTypeMap = computed(() => 
  productTypes.value.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);
const supplierCodeMap = computed(() => 
  supplierCodes.value.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);

// --- Logic ---
const searchInbounds = async () => {
  if (searchTerm.value.length < 1) {
    searchResults.value = [];
    return;
  }
  isLoading.value = true;
  searchError.value = '';
  try {
    const params = { invoice: searchTerm.value, size: 10 };
    const response = await inboundApi.getInbounds(params);
    searchResults.value = response.data.content;
  } catch (err) {
    console.error("Inbound search failed:", err);
    if (err.response?.data?.code === 'VALIDATION_ERROR') {
      searchError.value = err.response.data.validationErrors[0]?.message || 'Dữ liệu tìm kiếm không hợp lệ.';
    } else {
      searchError.value = 'Lỗi khi tìm kiếm phiếu nhập.';
    }
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const selectInbound = (inbound) => {
  selectedInbound.value = inbound;
  searchTerm.value = `HĐ #${inbound.invoice} (${productTypeMap.value[inbound.productType]})`;
  searchResults.value = [];
  emit('update:modelValue', inbound.id);
  emit('inbound-selected', inbound);
};

const resetSelection = () => {
  selectedInbound.value = null;
  searchTerm.value = '';
  searchError.value = '';
  emit('update:modelValue', null);
  emit('inbound-selected', null);
};

// Debounce search
watch(searchTerm, (newValue) => {
  if (selectedInbound.value) return;
  clearTimeout(debounceTimer.value);
  debounceTimer.value = setTimeout(() => {
    searchInbounds();
  }, 500);
});
</script>

<template>
  <div class="search-select-container">
    <label for="inbound-search">Tìm & Chọn Phiếu Nhập Kho</label>
    <div class="input-wrapper">
      <input
        id="inbound-search"
        type="text"
        v-model="searchTerm"
        placeholder="Nhập số hóa đơn để tìm..."
        :disabled="!!selectedInbound"
        autocomplete="off"
      />
      <button v-if="selectedInbound" @click="resetSelection" type="button" class="clear-btn" title="Chọn lại">&times;</button>
    </div>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="searchError" class="error-message">{{ searchError }}</p>

    <div v-if="isLoading" class="results-list loading">Đang tìm kiếm...</div>
    <ul v-else-if="searchResults.length > 0" class="results-list">
      <li v-for="inbound in searchResults" :key="inbound.id" @click="selectInbound(inbound)">
        <!-- SỬA LẠI TEMPLATE HIỂN THỊ Ở ĐÂY -->
        <div class="result-item">
          <span class="result-invoice">HĐ: {{ inbound.invoice }}</span>
          <span class="result-product">{{ productTypeMap[inbound.productType] || inbound.productType }}</span>
        </div>
        <div class="result-details">
          <span>NCC: {{ supplierCodeMap[inbound.supplierCd] || inbound.supplierCd }}</span>
          <span>Nhập: {{ inbound.receiveDate }}</span>
          <span class="result-quantity">SL: {{ inbound.quantity }}</span>
        </div>
      </li>
    </ul>
    <div v-else-if="searchTerm && !selectedInbound && !isLoading && !searchError" class="results-list no-results">
      Không tìm thấy kết quả.
    </div>
  </div>
</template>

<style scoped>
/* Style không thay đổi, giữ nguyên như cũ */
.search-select-container {
  position: relative;
  width: 100%;
}
.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.input-wrapper:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}
input {
  flex-grow: 1;
  border: none;
  padding: 0.75rem;
  outline: none;
  background: transparent;
}
.clear-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.75rem;
  color: #666;
}
.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 4px;
}
.results-list {
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.results-list li {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.results-list li:last-child {
  border-bottom: none;
}
.results-list li:hover {
  background-color: #f0f0f0;
}
.result-item {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  margin-bottom: 0.25rem;
}
.result-invoice {
  color: #0056b3;
}
.result-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;
}
.result-quantity {
  font-weight: bold;
}
.loading, .no-results {
  padding: 1rem;
  text-align: center;
  color: #777;
}
</style>