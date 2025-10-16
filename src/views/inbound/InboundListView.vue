<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDictionaryStore } from '@/stores/dictionary'
import { storeToRefs } from 'pinia'
import inboundApi from '@/api/inbound.js'
import BaseTable from '@/components/base/BaseTable.vue'
import BasePagination from '@/components/base/BasePagination.vue'
import InboundImportModal from '@/components/specific/InboundImportModal.vue'

// --- Khởi tạo ---
const router = useRouter()
const dictionaryStore = useDictionaryStore()
const { productTypes, supplierCodes } = storeToRefs(dictionaryStore)

// --- State ---
const inbounds = ref([])
const isLoading = ref(true)
const error = ref(null)
const isImportModalOpen = ref(false)
const debounceTimer = ref(null) // THÊM MỚI: State để lưu timer cho debounce

const filters = reactive({
  productType: '',
  supplierCd: '',
  invoice: '', // THÊM MỚI: State cho ô tìm kiếm hóa đơn
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0,
})

const tableColumns = [
  { key: 'id', label: 'ID' },
  { key: 'invoice', label: 'Hóa đơn' },
  { key: 'productType', label: 'Loại sản phẩm' },
  { key: 'supplierCd', label: 'Nhà cung cấp' },
  { key: 'receiveDate', label: 'Ngày nhận' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động' },
]

// --- LOGIC MỚI: TẠO BẢN ĐỒ TRA CỨU ---
const productTypeMap = computed(() => {
  return productTypes.value.reduce((map, item) => {
    map[item.code] = item.name
    return map
  }, {})
})

const supplierCodeMap = computed(() => {
  return supplierCodes.value.reduce((map, item) => {
    map[item.code] = item.name
    return map
  }, {})
})

// --- Logic ---
const fetchInbounds = async () => {
  isLoading.value = true
  error.value = null
  try {
    const params = {
      page: pagination.currentPage,
      size: pagination.pageSize,
      productType: filters.productType || null,
      supplierCd: filters.supplierCd || null,
      invoice: filters.invoice || null, // THÊM MỚI: Gửi param invoice lên API
    }
    const response = await inboundApi.getInbounds(params)
    inbounds.value = response.data.content
    pagination.totalPages = response.data.totalPages
    pagination.totalItems = response.data.totalItems
  } catch (err) {
    console.error('Failed to fetch inbounds:', err)
    error.value = 'Không thể tải danh sách phiếu nhập.'
  } finally {
    isLoading.value = false
  }
}

// THÊM MỚI: Hàm xử lý debounce cho tất cả các filter
const handleFilterChange = () => {
  clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(() => {
    // Khi filter thay đổi, luôn quay về trang 1
    if (pagination.currentPage !== 1) {
      pagination.currentPage = 1
    } else {
      // Nếu đã ở trang 1, gọi fetch luôn
      fetchInbounds()
    }
  }, 500) // Chờ 500ms sau khi người dùng ngừng nhập
}

const handleDelete = async (inboundId) => {
  if (confirm(`Bạn có chắc chắn muốn xóa phiếu nhập #${inboundId} không?`)) {
    try {
      await inboundApi.deleteInbound(inboundId)
      alert('Xóa thành công!')
      fetchInbounds()
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại.')
    }
  }
}

const handleImportSuccess = () => {
  fetchInbounds()
}

// --- Hooks & Watchers ---
onMounted(() => {
  dictionaryStore.fetchDictionaries()
  fetchInbounds()
})

// SỬA ĐỔI: Chỉ watch trang hiện tại, vì filter đã được xử lý bằng handleFilterChange
watch(
  () => pagination.currentPage,
  () => {
    fetchInbounds()
  }
)
</script>

<template>
  <div class="inbound-list-page">
    <header class="page-header">
      <h1>Quản lý Nhập kho</h1>
      <div class="actions">
        <button class="btn-primary" @click="router.push('/inbounds/create')">Tạo mới</button>
        <button class="btn-secondary" @click="isImportModalOpen = true">Import</button>
      </div>
    </header>

    <div class="filter-section">
      <!-- THÊM MỚI: Ô input tìm kiếm theo hóa đơn -->
      <input
        type="text"
        v-model="filters.invoice"
        placeholder="Tìm theo hóa đơn..."
        @input="handleFilterChange"
        class="filter-input"
      />
      <!-- SỬA ĐỔI: Dùng @change thay vì v-model để đồng bộ với debounce -->
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

    <BaseTable :columns="tableColumns" :items="inbounds" :is-loading="isLoading">
      <!-- SỬA LẠI CÁCH HIỂN THỊ CÁC CỘT NÀY -->
      <template #cell(productType)="{ item }">
        <span>{{ productTypeMap[item.productType] || item.productType }}</span>
      </template>

      <template #cell(supplierCd)="{ item }">
        <span>{{ supplierCodeMap[item.supplierCd] || item.supplierCd }}</span>
      </template>

      <template #cell(status)="{ item }">
        <span>{{
          item.status === 0 ? 'Chưa xuất' : item.status === 1 ? 'Xuất một phần' : 'Đã xuất hết'
        }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <div class="action-buttons">
          <button @click="router.push(`/inbounds/${item.id}`)">Xem</button>
          <button :disabled="!item.editable" @click="router.push(`/inbounds/edit/${item.id}`)">
            Sửa
          </button>
          <button :disabled="!item.editable" @click="handleDelete(item.id)">Xóa</button>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      v-model:currentPage="pagination.currentPage"
      :total-pages="pagination.totalPages"
    />

    <InboundImportModal v-model="isImportModalOpen" @import-success="handleImportSuccess" />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.filter-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
/* THÊM MỚI: Style cho ô input để đồng bộ */
.filter-section input,
.filter-section select {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
.action-buttons {
  display: flex;
  gap: 0.5rem;
}
.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>