<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';
import outboundApi from '@/api/outbound.js';
import BaseTable from '@/components/base/BaseTable.vue';
import BasePagination from '@/components/base/BasePagination.vue';

// --- Khởi tạo ---
const router = useRouter();
const dictionaryStore = useDictionaryStore();
// Lấy shippingMethods từ store
const { shippingMethods } = storeToRefs(dictionaryStore);

// --- State ---
const outbounds = ref([]);
const isLoading = ref(true);
const error = ref(null);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0,
});

// Cấu hình các cột cho bảng
const tableColumns = [
  { key: 'id', label: 'ID Xuất' },
  { key: 'inbId', label: 'ID Nhập' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'shippingMethod', label: 'Phương thức' },
  { key: 'shippingDate', label: 'Ngày xuất' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'actions', label: 'Hành động' },
];

// Tạo bản đồ tra cứu cho phương thức vận chuyển
const shippingMethodMap = computed(() => {
  return shippingMethods.value.reduce((map, item) => {
    map[item.code] = item.name;
    return map;
  }, {});
});

// --- Logic ---
const fetchOutbounds = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
    };
    const response = await outboundApi.getOutbounds(params);
    outbounds.value = response.data.content;
    pagination.totalPages = response.data.totalPages;
    pagination.totalItems = response.data.totalItems;
  } catch (err) {
    console.error("Failed to fetch outbounds:", err);
    error.value = "Không thể tải danh sách phiếu xuất.";
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async (outboundId) => {
  if (confirm(`Bạn có chắc chắn muốn xóa phiếu xuất #${outboundId} không?`)) {
    try {
      await outboundApi.deleteOutbound(outboundId);
      alert('Xóa thành công!');
      fetchOutbounds(); // Tải lại danh sách
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại.');
    }
  }
};

// --- Hooks & Watchers ---
onMounted(() => {
  dictionaryStore.fetchDictionaries(); // Tải tất cả dữ liệu dùng chung
  fetchOutbounds();
});

// Tự động gọi lại API khi trang thay đổi
watch(() => pagination.currentPage, fetchOutbounds);

</script>

<template>
  <div class="outbound-list-page">
    <header class="page-header">
      <h1>Quản lý Xuất kho</h1>
      <div class="actions">
        <button class="btn-primary" @click="router.push('/outbounds/create')">Tạo mới</button>
      </div>
    </header>

    <div v-if="error" class="error-message">{{ error }}</div>

    <BaseTable :columns="tableColumns" :items="outbounds" :is-loading="isLoading">
      <!-- Tùy chỉnh hiển thị cho cột 'shippingMethod' -->
      <template #cell(shippingMethod)="{ item }">
        <span>{{ shippingMethodMap[item.shippingMethod] || item.shippingMethod }}</span>
      </template>

      <!-- Tùy chỉnh hiển thị cho cột 'actions' -->
      <template #cell(actions)="{ item }">
        <div class="action-buttons">
          <button @click="router.push(`/outbounds/${item.id}`)">Xem</button>
          <button :disabled="!item.editable" @click="router.push(`/outbounds/edit/${item.id}`)">Sửa</button>
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
.action-buttons { display: flex; gap: 0.5rem; }
.action-buttons button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>