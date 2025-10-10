<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';
import inboundApi from '@/api/inbound.js';
import BaseTable from '@/components/base/BaseTable.vue';
import BasePagination from '@/components/base/BasePagination.vue';
import { formatNumber } from '@/utils/formatters.js';

// --- Khởi tạo ---
const dictionaryStore = useDictionaryStore();
const { productTypes, supplierCodes } = storeToRefs(dictionaryStore);

// --- State ---
const stats = ref([]);
const grandTotalQuantity = ref(0);
const isLoading = ref(true);
const error = ref(null);

const filters = reactive({
  productType: '',
  supplierCd: '', // Sửa lại từ productCd trong yêu cầu của bạn cho khớp với API
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0,
});

const tableColumns = [
  { key: 'productType', label: 'Loại sản phẩm' },
  { key: 'supplierCd', label: 'Nhà cung cấp' },
  { key: 'totalQuantity', label: 'Tổng số lượng nhập' },
  { key: 'inboundCount', label: 'Số phiếu nhập' },
];

// --- Dữ liệu tra cứu (Computed) ---
const productTypeMap = computed(() => 
  productTypes.value.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);
const supplierCodeMap = computed(() => 
  supplierCodes.value.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);

// --- Logic ---
const fetchStatistics = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      // Gửi null nếu không chọn filter để backend bỏ qua
      productType: filters.productType || null,
      supplierCd: filters.supplierCd || null,
    };
    const response = await inboundApi.getStatistics(params);
    stats.value = response.data.content;
    grandTotalQuantity.value = response.data.grandTotalQuantity;
    pagination.totalPages = response.data.totalPages;
    pagination.totalItems = response.data.totalItems;
  } catch (err) {
    console.error("Failed to fetch statistics:", err);
    error.value = "Không thể tải dữ liệu thống kê.";
  } finally {
    isLoading.value = false;
  }
};

// --- Hooks & Watchers ---
onMounted(() => {
  dictionaryStore.fetchDictionaries();
  fetchStatistics();
});

// Theo dõi sự thay đổi của filter và trang hiện tại để gọi lại API
watch([filters, () => pagination.currentPage], () => {
  fetchStatistics();
}, { deep: true });

// Khi người dùng thay đổi filter, quay về trang 1
watch(filters, () => {
  if (pagination.currentPage !== 1) {
    pagination.currentPage = 1;
  }
});
</script>

<template>
  <div class="stats-page">
    <header class="page-header">
      <h1>Thống kê Nhập kho</h1>
      <p>Tổng hợp số lượng hàng đã nhập theo sản phẩm và nhà cung cấp.</p>
    </header>

    <div class="filter-section">
      <select v-model="filters.productType">
        <option value="">Tất cả sản phẩm</option>
        <option v-for="pt in productTypes" :key="pt.code" :value="pt.code">{{ pt.name }}</option>
      </select>
      <select v-model="filters.supplierCd">
        <option value="">Tất cả nhà cung cấp</option>
        <option v-for="sc in supplierCodes" :key="sc.code" :value="sc.code">{{ sc.name }}</option>
      </select>
    </div>

    <div class="summary-card">
      <h3>Tổng số lượng nhập (theo bộ lọc)</h3>
      <p class="grand-total">{{ formatNumber(grandTotalQuantity) }}</p>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <BaseTable :columns="tableColumns" :items="stats" :is-loading="isLoading">
      <template #cell(productType)="{ item }">
        <span>{{ productTypeMap[item.productType] || item.productType }}</span>
      </template>
      <template #cell(supplierCd)="{ item }">
        <span>{{ supplierCodeMap[item.supplierCd] || item.supplierCd }}</span>
      </template>
      <template #cell(totalQuantity)="{ item }">
        <strong>{{ formatNumber(item.totalQuantity) }}</strong>
      </template>
    </BaseTable>

    <BasePagination 
      v-model:currentPage="pagination.currentPage" 
      :total-pages="pagination.totalPages"
    />
  </div>
</template>

<style scoped>
.stats-page {
  max-width: 1000px;
  margin: auto;
}
.page-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}
.filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}
.filter-section select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.summary-card {
  background-color: #e9f7ef;
  border-left: 5px solid #28a745;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  border-radius: 4px;
}
.summary-card h3 {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  color: #155724;
}
.grand-total {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #155724;
}
.error-message {
  color: red;
  text-align: center;
  padding: 1rem;
}
</style>