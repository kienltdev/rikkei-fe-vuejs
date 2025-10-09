<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';
import inboundApi from '@/api/inbound.js';
import BaseTable from '@/components/base/BaseTable.vue';
import BasePagination from '@/components/base/BasePagination.vue';

// --- Khởi tạo ---
const router = useRouter();
const dictionaryStore = useDictionaryStore();
const { productTypes, supplierCodes } = storeToRefs(dictionaryStore);

// --- State ---
const inbounds = ref([]);
const isLoading = ref(true);
const error = ref(null);

const filters = reactive({
  productType: '',
  supplierCd: '',
});

const pagination = reactive({
  currentPage: 1,
  pageSize: 10, // Hoặc lấy từ config
  totalPages: 1,
  totalItems: 0,
});

// Cấu hình các cột cho BaseTable
const tableColumns = [
  { key: 'id', label: 'ID' },
  { key: 'invoice', label: 'Hóa đơn' },
  { key: 'productType', label: 'Loại sản phẩm' },
  { key: 'supplierCd', label: 'Nhà cung cấp' },
  { key: 'receiveDate', label: 'Ngày nhận' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động' },
];

// --- Logic ---
const fetchInbounds = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      productType: filters.productType || null,
      supplierCd: filters.supplierCd || null,
    };
    const response = await inboundApi.getInbounds(params);
    inbounds.value = response.data.content;
    pagination.totalPages = response.data.totalPages;
    pagination.totalItems = response.data.totalItems;
  } catch (err) {
    console.error("Failed to fetch inbounds:", err);
    error.value = "Không thể tải danh sách phiếu nhập.";
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (inboundId) => {
  if (confirm(`Bạn có chắc chắn muốn xóa phiếu nhập #${inboundId} không?`)) {
    try {
      await inboundApi.deleteInbound(inboundId);
      alert('Xóa thành công!');
      fetchInbounds(); // Tải lại danh sách sau khi xóa
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại.');
    }
  }
};

// --- Hooks & Watchers ---
onMounted(() => {
  dictionaryStore.fetchDictionaries();
  fetchInbounds();
});

// Tự động gọi lại API khi filter hoặc trang thay đổi
watch([filters, () => pagination.currentPage], () => {
  // Nếu filter thay đổi, quay về trang 1
  if (filters.productType !== filters.productType || filters.supplierCd !== filters.supplierCd) {
    pagination.currentPage = 1;
  }
  fetchInbounds();
}, { deep: true });

</script>

<template>
  <div class="inbound-list-page">
    <header class="page-header">
      <h1>Quản lý Nhập kho</h1>
      <div class="actions">
        <button class="btn-primary" @click="router.push('/inbounds/create')">Tạo mới</button>
        <button class="btn-secondary">Import</button>
      </div>
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

    <div v-if="error" class="error-message">{{ error }}</div>

    <BaseTable :columns="tableColumns" :items="inbounds" :is-loading="isLoading">
      <!-- Tùy chỉnh hiển thị cho cột 'status' -->
      <template #cell(status)="{ item }">
        <span>{{ item.status === 0 ? 'Chưa xuất' : (item.status === 1 ? 'Xuất một phần' : 'Đã xuất hết') }}</span>
      </template>

      <!-- Tùy chỉnh hiển thị cho cột 'actions' -->
      <template #cell(actions)="{ item }">
        <div class="action-buttons">
          <button @click="router.push(`/inbounds/${item.id}`)">Xem</button>
          <button :disabled="!item.editable" @click="router.push(`/inbounds/edit/${item.id}`)">Sửa</button>
          <button :disabled="!item.editable" @click="handleDelete(item.id)">Xóa</button>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      v-model:currentPage="pagination.currentPage"
      :total-pages="pagination.totalPages"
    />
  </div>
</template>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.actions { display: flex; gap: 0.5rem; }
.filter-section { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.action-buttons { display: flex; gap: 0.5rem; }
.action-buttons button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
