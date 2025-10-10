<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import outboundApi from '@/api/outbound.js';
import { useDictionaryStore } from '@/stores/dictionary';
import InboundDetailCard from '@/components/specific/InboundDetailCard.vue';

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const dictionaryStore = useDictionaryStore();
dictionaryStore.fetchDictionaries();

const outboundDetail = ref(null);
const isLoading = ref(true);
const error = ref(null);

const shippingMethodMap = computed(() => 
  dictionaryStore.shippingMethods.reduce((map, item) => ({ ...map, [item.code]: item.name }), {})
);

const fetchOutboundDetail = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await outboundApi.getOutboundDetail(props.id);
    outboundDetail.value = response.data;
  } catch (err) {
    console.error("Failed to fetch outbound detail:", err);
    error.value = `Không tìm thấy phiếu xuất với ID #${props.id}.`;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOutboundDetail);
</script>

<template>
  <div class="detail-page">
    <header class="page-header">
      <h1 v-if="outboundDetail">Chi tiết Phiếu xuất #{{ outboundDetail.id }}</h1>
      <h1 v-else>Đang tải...</h1>
      <button @click="router.back()">Quay lại Danh sách</button>
    </header>

    <div v-if="isLoading" class="loading-indicator">Đang tải dữ liệu...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>

    <div v-else-if="outboundDetail" class="content-container">
      <!-- Thông tin phiếu xuất -->
      <div class="info-card">
        <h3>Thông tin Phiếu xuất</h3>
        <div class="info-grid">
          <p><strong>ID:</strong> {{ outboundDetail.id }}</p>
          <p><strong>Số lượng xuất:</strong> {{ outboundDetail.quantity }}</p>
          <p><strong>Phương thức:</strong> {{ shippingMethodMap[outboundDetail.shippingMethod] || outboundDetail.shippingMethod }}</p>
          <p><strong>Ngày xuất:</strong> {{ outboundDetail.shippingDate }}</p>
          <p><strong>Ngày tạo:</strong> {{ new Date(outboundDetail.createdAt).toLocaleString() }}</p>
          <p><strong>Cập nhật lần cuối:</strong> {{ new Date(outboundDetail.updatedAt).toLocaleString() }}</p>
        </div>
      </div>

      <!-- Thông tin phiếu nhập liên quan -->
      <InboundDetailCard :inbound="outboundDetail.inboundSummary" />
    </div>
  </div>
</template>

<style scoped>
.detail-page { max-width: 800px; margin: auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.loading-indicator, .error-message { text-align: center; padding: 2rem; }
.info-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
</style>