<script setup>
import { ref, onMounted, computed } from 'vue';
import reportApi from '@/api/report.js';
import BaseTable from '@/components/base/BaseTable.vue';
import { formatNumber } from '@/utils/formatters.js';

// --- BƯỚC 1: IMPORT THƯ VIỆN BIỂU ĐỒ ---
import { Bar, Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

// --- BƯỚC 2: ĐĂNG KÝ CÁC THÀNH PHẦN CỦA CHART.JS ---
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);


// --- State (giữ nguyên) ---
const selectedYear = ref(new Date().getFullYear());
const reportData = ref(null);
const isLoading = ref(false);
const error = ref(null);

// --- Cấu hình bảng (giữ nguyên) ---
const tableColumns = [
  { key: 'month', label: 'Tháng' },
  { key: 'beginningBalance', label: 'Tồn đầu kỳ' },
  { key: 'inboundQuantity', label: 'Nhập trong kỳ' },
  { key: 'outboundQuantity', label: 'Xuất trong kỳ' },
  { key: 'difference', label: 'Chênh lệch' },
  { key: 'endingBalance', label: 'Tồn cuối kỳ' },
];

// --- BƯỚC 3: CHUẨN BỊ DỮ LIỆU VÀ CẤU HÌNH CHO BIỂU ĐỒ ---
const chartLabels = computed(() => 
  reportData.value?.monthlyReports.map(r => `Tháng ${r.month}`) || []
);

// Dữ liệu cho biểu đồ cột Nhập/Xuất
const barChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Nhập trong kỳ',
      backgroundColor: '#28a745', // Green
      data: reportData.value?.monthlyReports.map(r => r.inboundQuantity) || [],
    },
    {
      label: 'Xuất trong kỳ',
      backgroundColor: '#dc3545', // Red
      data: reportData.value?.monthlyReports.map(r => r.outboundQuantity) || [],
    },
  ],
}));

// Dữ liệu cho biểu đồ đường Tồn kho
const lineChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: 'Tồn kho cuối kỳ',
      borderColor: '#007bff', // Blue
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      tension: 0.3,
      fill: true,
      data: reportData.value?.monthlyReports.map(r => r.endingBalance) || [],
    },
  ],
}));

// Cấu hình chung cho các biểu đồ
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += formatNumber(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      ticks: {
        callback: function(value) {
          return formatNumber(value);
        }
      }
    }
  }
});


// --- Logic (giữ nguyên) ---
const fetchReport = async () => {
  if (!selectedYear.value) {
    error.value = "Vui lòng chọn một năm để xem báo cáo.";
    return;
  }
  isLoading.value = true;
  error.value = null;
  reportData.value = null;

  try {
    const response = await reportApi.getMonthlyInventoryReport(selectedYear.value);
    reportData.value = response.data;
  } catch (err) {
    console.error("Failed to fetch monthly report:", err);
    error.value = err.response?.data?.message || "Không thể tải báo cáo. Vui lòng thử lại.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchReport);
</script>

<template>
  <div class="report-page">
    <header class="page-header">
      <h1>Báo cáo Tồn kho Hàng tháng</h1>
      <p>Xem chi tiết số lượng nhập, xuất, và tồn kho của từng tháng trong năm.</p>
    </header>

    <div class="filter-section">
      <label for="year-select">Chọn năm:</label>
      <input 
        id="year-select"
        type="number"
        :min="1970"
        :max="new Date().getFullYear() + 5"
        v-model.number="selectedYear"
      />
      <button @click="fetchReport" :disabled="isLoading">
        {{ isLoading ? 'Đang tải...' : 'Xem báo cáo' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Đang tải dữ liệu báo cáo...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    
    <div v-else-if="reportData" class="report-container">
      <h2>Báo cáo năm {{ reportData.year }}</h2>

      <!-- BƯỚC 4: THÊM BIỂU ĐỒ VÀO TEMPLATE -->
      <div class="charts-grid">
        <div class="chart-wrapper">
          <h3>Biểu đồ Nhập/Xuất kho hàng tháng</h3>
          <div class="chart-container">
            <Bar :data="barChartData" :options="chartOptions" />
          </div>
        </div>
        <div class="chart-wrapper">
          <h3>Biểu đồ xu hướng Tồn kho cuối kỳ</h3>
          <div class="chart-container">
            <LineChart :data="lineChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <h3 class="table-title">Bảng dữ liệu chi tiết</h3>
      <BaseTable :columns="tableColumns" :items="reportData.monthlyReports">
        <template #cell(beginningBalance)="{ item }">
          {{ formatNumber(item.beginningBalance) }}
        </template>
        <template #cell(inboundQuantity)="{ item }">
          <span class="positive-value">+{{ formatNumber(item.inboundQuantity) }}</span>
        </template>
        <template #cell(outboundQuantity)="{ item }">
          <span class="negative-value">-{{ formatNumber(item.outboundQuantity) }}</span>
        </template>
        <template #cell(difference)="{ item }">
          <span :class="item.difference >= 0 ? 'positive-value' : 'negative-value'">
            {{ item.difference >= 0 ? '+' : '' }}{{ formatNumber(item.difference) }}
          </span>
        </template>
        <template #cell(endingBalance)="{ item }">
          <strong>{{ formatNumber(item.endingBalance) }}</strong>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<style scoped>
.report-page {
  max-width: 1200px;
  margin: auto;
}
.page-header {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}
.filter-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}
.filter-section label {
  font-weight: 500;
}
.filter-section input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100px;
}
.filter-section button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
.filter-section button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
.loading-indicator, .error-message {
  text-align: center;
  padding: 2rem;
  color: #555;
}
.error-message {
  color: #dc3545;
}
.report-container h2 {
  text-align: center;
  margin-bottom: 2rem;
}

/* --- STYLE MỚI CHO BIỂU ĐỒ --- */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}
.chart-wrapper {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.chart-wrapper h3 {
  margin-top: 0;
  text-align: center;
  font-weight: 500;
  margin-bottom: 1.5rem;
}
.chart-container {
  height: 350px; /* Chiều cao cố định cho biểu đồ */
  position: relative;
}
.table-title {
  margin-top: 3rem;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

/* Responsive cho màn hình nhỏ */
@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.positive-value {
  color: #28a745; /* Green */
}
.negative-value {
  color: #dc3545; /* Red */
}
</style>