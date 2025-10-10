<script setup>
import { computed } from 'vue';
import { useDictionaryStore } from '@/stores/dictionary';

const props = defineProps({
  inbound: { type: Object, required: true },
});

const dictionaryStore = useDictionaryStore();

// --- SỬA LẠI LOGIC Ở ĐÂY ---
// Tạo map một cách trực tiếp, không cần storeToRefs lồng nhau
const productTypeMap = computed(() => 
  dictionaryStore.productTypes.reduce((map, item) => {
    map[item.code] = item.name;
    return map;
  }, {})
);

const supplierCodeMap = computed(() => 
  dictionaryStore.supplierCodes.reduce((map, item) => {
    map[item.code] = item.name;
    return map;
  }, {})
);

// Helper để hiển thị tên thay vì code
const getStatusText = (status) => {
    switch(status) {
        case 0: return 'Chưa xuất';
        case 1: return 'Xuất một phần';
        case 2: return 'Đã xuất hết';
        default: return 'Không xác định';
    }
}
</script>

<template>
  <div class="info-card">
    <h3>Thông tin Phiếu nhập đã chọn</h3>
    <div class="info-grid">
      <p><strong>ID:</strong> {{ inbound.id }}</p>
      <p><strong>Hóa đơn:</strong> {{ inbound.invoice }}</p>
      <p><strong>Loại sản phẩm:</strong> {{ productTypeMap[inbound.productType] || inbound.productType }}</p>
      <p><strong>Nhà cung cấp:</strong> {{ supplierCodeMap[inbound.supplierCd] || inbound.supplierCd }}</p>
      <p><strong>Ngày nhận:</strong> {{ inbound.receiveDate }}</p>
      <p><strong>Trạng thái:</strong> {{ getStatusText(inbound.status) }}</p>
      <p><strong>Tổng số lượng:</strong> {{ inbound.quantity }}</p>
      <p><strong>Số lượng còn lại:</strong> <strong class="available-qty">{{ inbound.quantityAvailable }}</strong></p>
    </div>
  </div>
</template>

<style scoped>
.info-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}
.info-card h3 { margin-top: 0; }
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
.info-grid p { margin: 0; }
.available-qty {
    color: #28a745;
    font-size: 1.1rem;
}
</style>