<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';
import inventoryApi from '@/api/inventory.js';
import BaseTable from '@/components/base/BaseTable.vue';
import BasePagination from '@/components/base/BasePagination.vue';
import { formatNumber } from '@/utils/formatters.js';

// --- Khởi tạo ---
const dictionaryStore = useDictionaryStore();
const { productTypes, supplierCodes } = storeToRefs(dictionaryStore);

// --- State ---
const summary = ref({ totalQuantityInbound: 0, totalQuantityAvailable: 0 });
const inventoryList = ref([]);
const isLoadingSummary = ref(true);
const isLoadingList = ref(true);
const error = ref(null);
const debounceTimer = ref(null);

const filters = reactive({
  invoice: '',
  productType: '',
  supplierCd: '',
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0,
});

// --- Cấu hình bảng ---
const tableColumns = [
  { key: 'inbId', label: 'ID Nhập' },
  { key: 'invoice', label: 'Hóa đơn' },
  { key: 'productType', label: 'Loại sản phẩm' },
  { key: 'supplierCd', label: 'Nhà cung cấp' },
  { key: 'totalQuantity', label: 'Tổng SL Nhập' },
  { key: 'availableQuantity', label: 'SL Khả dụng' },
  { key: 'status', label: 'Trạng thái' },
];

// --- Dữ liệu tra cứu (Computed) ---
const productTypeMap = computed(() => 
  productTypes.value.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);
const supplierCodeMap = computed(() => 
  supplierCodes.value.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);
const getStatusText = (status) => {
  switch(status) {
    case 0: return 'Chưa xuất';
    case 1: return 'Xuất một phần';
    case 2: return 'Đã xuất hết';
    default: return 'Không xác định';
  }
};

// --- Logic ---
const fetchSummary = async () => {
  isLoadingSummary.value = true;
  try {
    const params = {
      productType: filters.productType || null,
      supplierCd: filters.supplierCd || null,
      invoice: filters.invoice || null,
    };
    const response = await inventoryApi.getSummary(params);
    summary.value = response.data;
  } catch (err) {
    console.error("Failed to fetch summary:", err);
    error.value = "Không thể tải dữ liệu tổng quan.";
  } finally {
    isLoadingSummary.value = false;
  }
};

const fetchList = async () => {
  isLoadingList.value = true;
  try {
    const params = {
      ...filters,
      page: pagination.currentPage,
      size: pagination.pageSize,
    };
    // Xóa các key có giá trị rỗng hoặc null
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key];
      }
    });

    const response = await inventoryApi.getList(params);
    inventoryList.value = response.data.content;
    pagination.totalPages = response.data.totalPages;
    pagination.totalItems = response.data.totalItems;
  } catch (err) {
    console.error("Failed to fetch inventory list:", err);
    error.value = "Không thể tải danh sách chi tiết.";
  } finally {
    isLoadingList.value = false;
  }
};

const handleFilterChange = () => {
  clearTimeout(debounceTimer.value);
  debounceTimer.value = setTimeout(() => {
    // Khi filter thay đổi, reset về trang 1 và gọi cả 2 API
    if (pagination.currentPage !== 1) {
      pagination.currentPage = 1;
    }
    fetchSummary();
    fetchList();
  }, 500); // Chờ 500ms sau khi người dùng ngừng gõ
};

// --- Hooks & Watchers ---
onMounted(() => {
  dictionaryStore.fetchDictionaries();
  fetchSummary();
  fetchList();
});

// Chỉ gọi lại API list khi chuyển trang
watch(() => pagination.currentPage, fetchList);
</script>

<template>
  <div class="inventory-page">
    <header class="page-header">
      <h1>Quản lý Tồn kho</h1>
      <p>Theo dõi số lượng hàng hóa trong kho theo từng lô hàng.</p>
    </header>

    <!-- Phần 1: Thẻ Tóm tắt -->
    <div class="summary-grid">
      <div class="summary-card inbound">
        <div class="card-content">
          <h3 class="card-title">Tổng Lượng Hàng Đã Nhập</h3>
          <p class="card-value">{{ isLoadingSummary ? '...' : formatNumber(summary.totalQuantityInbound) }}</p>
        </div>
      </div>
      <div class="summary-card available">
        <div class="card-content">
          <h3 class="card-title">Tổng Lượng Hàng Tồn Kho</h3>
          <p class="card-value">{{ isLoadingSummary ? '...' : formatNumber(summary.totalQuantityAvailable) }}</p>
        </div>
      </div>
    </div>

    <!-- Phần 2: Bộ lọc -->
    <div class="filter-section">
      <!-- <input type="number" v-model="filters.inbId" placeholder="Lọc theo ID Nhập..." @input="handleFilterChange" /> --> <!-- <-- XÓA DÒNG NÀY -->
      <input type="text" v-model="filters.invoice" placeholder="Lọc theo Hóa đơn..." @input="handleFilterChange" />
      <select v-model="filters.productType" @change="handleFilterChange">
        <option value="">Tất cả sản phẩm</option>
        <option v-for="pt in productTypes" :key="pt.code" :value="pt.code">{{ pt.name }}</option>
      </select>
      <select v-model="filters.supplierCd" @change="handleFilterChange">
        <option value="">Tất cả nhà cung cấp</option>
        <option v-for="sc in supplierCodes" :key="sc.code" :value="sc.code">{{ sc.name }}</option>
      </select>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Phần 3: Bảng Chi tiết -->
    <BaseTable :columns="tableColumns" :items="inventoryList" :is-loading="isLoadingList">
      <template #cell(productType)="{ item }">
        <span>{{ productTypeMap[item.productType] || item.productType }}</span>
      </template>
      <template #cell(supplierCd)="{ item }">
        <span>{{ supplierCodeMap[item.supplierCd] || item.supplierCd }}</span>
      </template>
      <template #cell(status)="{ item }">
        <span :class="`status-${item.status}`">{{ getStatusText(item.status) }}</span>
      </template>
      <template #cell(availableQuantity)="{ item }">
        <strong class="available-qty">{{ formatNumber(item.availableQuantity) }}</strong>
      </template>
    </BaseTable>

    <BasePagination 
      v-model:currentPage="pagination.currentPage" 
      :total-pages="pagination.totalPages"
    />
  </div>
</template>

<style scoped>
.inventory-page { max-width: 1200px; margin: auto; }
.page-header { margin-bottom: 1.5rem; }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.summary-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 5px solid;
}
.summary-card.inbound { border-color: #007bff; }
.summary-card.available { border-color: #28a745; }
.card-title { margin: 0 0 0.5rem 0; font-size: 1rem; color: #555; }
.card-value { margin: 0; font-size: 2.25rem; font-weight: 700; }

.filter-section {
  display: grid;
  /* Cập nhật lại grid để trông đẹp hơn khi chỉ còn 3 item */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}
.filter-section input, .filter-section select {
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.status-0 { color: #007bff; } /* Chưa xuất - Blue */
.status-1 { color: #ffc107; } /* Xuất một phần - Yellow/Orange */
.status-2 { color: #6c757d; } /* Đã xuất hết - Gray */
.available-qty { color: #28a745; }
</style>