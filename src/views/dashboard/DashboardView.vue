<script setup>
import { ref, onMounted } from 'vue';
import inventoryApi from '@/api/inventory.js';
import { formatNumber } from '@/utils/formatters.js';

// --- State ---
const summaryData = ref(null); // Lưu dữ liệu từ API
const isLoading = ref(true);   // Cờ theo dõi trạng thái tải
const error = ref(null);       // Lưu thông báo lỗi

// --- Logic ---
// Hàm để gọi API và cập nhật state
const fetchSummary = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await inventoryApi.getSummary();
    summaryData.value = response.data;
  } catch (err) {
    console.error("Failed to fetch inventory summary:", err);
    error.value = "Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.";
  } finally {
    isLoading.value = false;
  }
};

// Sử dụng onMounted để gọi hàm fetchSummary khi component được tạo
onMounted(() => {
  fetchSummary();
});
</script>

<template>
  <div class="dashboard-page">
    <header class="page-header">
      <h1>Bảng điều khiển</h1>
      <p>Tổng quan nhanh về tình hình kho hàng của bạn.</p>
    </header>

    <!-- Hiển thị khi đang tải dữ liệu -->
    <div v-if="isLoading" class="loading-indicator">
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Hiển thị khi có lỗi -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchSummary">Thử lại</button>
    </div>

    <!-- Hiển thị dữ liệu chính khi thành công -->
    <div v-else-if="summaryData" class="summary-grid">
      <div class="summary-card inbound">
        <div class="card-icon">📦</div>
        <div class="card-content">
          <h3 class="card-title">Tổng Lượng Hàng Đã Nhập</h3>
          <p class="card-value">{{ formatNumber(summaryData.totalQuantityInbound) }}</p>
        </div>
      </div>

      <div class="summary-card available">
        <div class="card-icon">✅</div>
        <div class="card-content">
          <h3 class="card-title">Tổng Lượng Hàng Tồn Kho</h3>
          <p class="card-value">{{ formatNumber(summaryData.totalQuantityAvailable) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
}

.page-header p {
  color: #666;
  font-size: 1rem;
}

.loading-indicator, .error-message {
  text-align: center;
  padding: 2rem;
  color: #555;
}

.error-message button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 5px solid;
}

.summary-card.inbound {
  border-color: #007bff;
}

.summary-card.available {
  border-color: #28a745;
}

.card-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
}

.card-content {
  flex-grow: 1;
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: #555;
}

.card-value {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: #333;
}
</style>
