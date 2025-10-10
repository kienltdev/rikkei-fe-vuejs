<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import inboundApi from '@/api/inbound.js';
import outboundApi from '@/api/outbound.js'; // Import outboundApi để xóa
import BaseTable from '@/components/base/BaseTable.vue';
import { useDictionaryStore } from '@/stores/dictionary';

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const dictionaryStore = useDictionaryStore();
dictionaryStore.fetchDictionaries(); // Đảm bảo dữ liệu được tải

const inboundDetail = ref(null);
const isLoading = ref(true);
const error = ref(null);

// --- TẠO CÁC BẢN ĐỒ TRA CỨU ---
const productTypeMap = computed(() => 
  dictionaryStore.productTypes.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);
const supplierCodeMap = computed(() => 
  dictionaryStore.supplierCodes.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);
const shippingMethodMap = computed(() => 
  dictionaryStore.shippingMethods.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);

// Cấu hình cột cho bảng Lịch sử Xuất kho
const outboundTableColumns = [
  { key: 'id', label: 'ID Xuất' },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'shippingMethod', label: 'Phương thức' },
  { key: 'shippingDate', label: 'Ngày xuất' },
  { key: 'createdAt', label: 'Ngày tạo' }, // THÊM MỚI: Khai báo cột Ngày tạo
  { key: 'updatedAt', label: 'Cập nhật' },
  { key: 'actions', label: 'Hành động' },
];

const fetchInboundDetail = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await inboundApi.getInboundDetail(props.id);
    inboundDetail.value = response.data;
  } catch (err) {
    console.error("Failed to fetch inbound detail:", err);
    error.value = `Không tìm thấy phiếu nhập với ID #${props.id}.`;
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteOutbound = async (outboundId) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phiếu xuất #${outboundId} không?`)) {
        try {
            await outboundApi.deleteOutbound(outboundId);
            alert('Xóa phiếu xuất thành công!');
            fetchInboundDetail(); // Tải lại toàn bộ chi tiết để cập nhật danh sách
        } catch (err)
{
            alert(err.response?.data?.message || 'Xóa thất bại.');
        }
    }
};

onMounted(fetchInboundDetail);
</script>

<template>
  <div class="detail-page">
    <header class="page-header">
      <h1 v-if="inboundDetail">Chi tiết Phiếu nhập #{{ inboundDetail.id }}</h1>
      <h1 v-else>Đang tải...</h1>
      <button @click="router.back()">Quay lại Danh sách</button>
    </header>

    <div v-if="isLoading" class="loading-indicator">Đang tải dữ liệu...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else-if="inboundDetail" class="content-grid">
      <div class="info-card">
        <h3>Thông tin Phiếu nhập</h3>
        <div class="info-grid">
          <p><strong>ID:</strong> {{ inboundDetail.id }}</p>
          <p><strong>Hóa đơn:</strong> {{ inboundDetail.invoice }}</p>
          <p><strong>Loại sản phẩm:</strong> {{ productTypeMap[inboundDetail.productType] || inboundDetail.productType }}</p>
          <p><strong>Nhà cung cấp:</strong> {{ supplierCodeMap[inboundDetail.supplierCd] || inboundDetail.supplierCd }}</p>
          <p><strong>Ngày nhận:</strong> {{ inboundDetail.receiveDate }}</p>
          <p><strong>Trạng thái:</strong> {{ inboundDetail.status === 0 ? 'Chưa xuất' : (inboundDetail.status === 1 ? 'Xuất một phần' : 'Đã xuất hết') }}</p>
          <p><strong>Tổng số lượng:</strong> {{ inboundDetail.quantity }}</p>
          <p><strong>Số lượng còn lại:</strong> {{ inboundDetail.quantityAvailable }}</p>
          <p><strong>Ngày tạo:</strong> {{ new Date(inboundDetail.createdAt).toLocaleString() }}</p>
          <p><strong>Cập nhật lần cuối:</strong> {{ new Date(inboundDetail.updatedAt).toLocaleString() }}</p>
        </div>
      </div>

      <div class="outbound-list-card">
        <h3>Lịch sử Xuất kho</h3>
        <BaseTable 
          :columns="outboundTableColumns" 
          :items="inboundDetail.outbounds"
        >
          <template #cell(shippingMethod)="{ item }">
            <span>{{ shippingMethodMap[item.shippingMethod] || item.shippingMethod }}</span>
          </template>
          
          <!-- THÊM MỚI: Slot để format cột Ngày tạo -->
          <template #cell(createdAt)="{ item }">
            <span>{{ new Date(item.createdAt).toLocaleString() }}</span>
          </template>

          <template #cell(updatedAt)="{ item }">
            <span>{{ new Date(item.updatedAt).toLocaleString() }}</span>
          </template>

          <template #cell(actions)="{ item }">
            <div class="action-buttons">
              <button @click="router.push(`/outbounds/edit/${item.id}`)">Sửa</button>
              <button @click="handleDeleteOutbound(item.id)">Xóa</button>
            </div>
          </template>
        </BaseTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Style không thay đổi */
.detail-page { max-width: 900px; margin: auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.loading-indicator, .error-message { text-align: center; padding: 2rem; }
.info-card, .outbound-list-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.info-card h3, .outbound-list-card h3 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 1rem; }
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.info-grid p { margin: 0; }
.action-buttons { display: flex; gap: 0.5rem; }
</style>