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
const { shippingMethods, productTypes } = storeToRefs(dictionaryStore);

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

// --- THAY ĐỔI: Cập nhật lại cấu hình cột, bỏ cột ID Nhập ---
const tableColumns = [
  { key: 'id', label: 'ID Xuất' },
  { key: 'invoice', label: 'Hóa đơn Nhập' },
  { key: 'productType', label: 'Loại sản phẩm' },
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

// Tạo bản đồ tra cứu cho loại sản phẩm
const productTypeMap = computed(() => {
  return productTypes.value.reduce((map, item) => {
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
  dictionaryStore.fetchDictionaries();
  fetchOutbounds();
});

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
      <template #cell(productType)="{ item }">
        <span>{{ productTypeMap[item.productType] || item.productType }}</span>
      </template>

      <template #cell(shippingMethod)="{ item }">
        <span>{{ shippingMethodMap[item.shippingMethod] || item.shippingMethod }}</span>
      </template>

      <template #cell(createdAt)="{ item }">
        <span>{{ new Date(item.createdAt).toLocaleString() }}</span>
      </template>

      <!-- Tùy chỉnh hiển thị cho cột 'actions' -->
      <template #cell(actions)="{ item }">
        <div class="action-buttons">
          <!-- THAY ĐỔI HÀNH VI NÚT "XEM" Ở ĐÂY -->
          <button @click="router.push(`/inbounds/${item.inbId}`)">Xem</button>
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