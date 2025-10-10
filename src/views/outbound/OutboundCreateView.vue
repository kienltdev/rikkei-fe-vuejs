<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import outboundApi from '@/api/outbound.js';
import inboundApi from '@/api/inbound.js'; // Cần API để lấy chi tiết
import { useDictionaryStore } from '@/stores/dictionary';
import InboundSearchSelect from '@/components/specific/InboundSearchSelect.vue';
import InboundDetailCard from '@/components/specific/InboundDetailCard.vue'; // Import component mới

const router = useRouter();
const dictionaryStore = useDictionaryStore();
dictionaryStore.fetchDictionaries();

// --- State ---
const selectedInboundId = ref(null);
const selectedInboundDetail = ref(null); // State mới để lưu chi tiết phiếu nhập
const isLoadingDetail = ref(false);

const formData = reactive({
  inbId: null,
  quantity: null,
  shippingMethod: '',
  shippingDate: '',
});

const isSubmitting = ref(false);
const errors = ref({});

// --- Logic ---
const handleInboundSelected = async (inbound) => {
  if (!inbound) {
    selectedInboundDetail.value = null;
    formData.inbId = null;
    return;
  }

  isLoadingDetail.value = true;
  try {
    // Gọi API để lấy dữ liệu chi tiết đầy đủ (bao gồm quantityAvailable)
    const response = await inboundApi.getInboundDetail(inbound.id);
    selectedInboundDetail.value = response.data;
    formData.inbId = inbound.id;
  } catch (err) {
    console.error("Failed to fetch selected inbound detail:", err);
    errors.value.general = "Không thể tải chi tiết phiếu nhập đã chọn.";
  } finally {
    isLoadingDetail.value = false;
  }
};

const handleCreate = async () => {
  isSubmitting.value = true;
  errors.value = {};
  try {
    await outboundApi.createOutbound(formData);
    alert('Tạo phiếu xuất thành công!');
    router.push({ name: 'outbound-list' });
  } catch (err) {
    if (err.response?.data?.code === 'VALIDATION_ERROR') {
      for (const validationError of err.response.data.validationErrors) {
        errors.value[validationError.field] = validationError.message;
      }
    } else {
      errors.value.general = err.response?.data?.message || 'Đã có lỗi xảy ra.';
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <header class="page-header">
        <h1>Tạo mới Phiếu Xuất kho</h1>
        <button @click="$router.back()">Quay lại</button>
    </header>

    <!-- Phần 1: Tìm kiếm -->
    <div class="form-group">
      <InboundSearchSelect 
        v-model="selectedInboundId" 
        @inbound-selected="handleInboundSelected"
      />
    </div>

    <div v-if="isLoadingDetail" class="loading-indicator">Đang tải chi tiết...</div>

    <!-- Phần 2: Hiển thị chi tiết và Form xuất kho -->
    <div v-if="selectedInboundDetail">
      <InboundDetailCard :inbound="selectedInboundDetail" />

      <form @submit.prevent="handleCreate" class="outbound-form">
        <h3 class="form-title">Thông tin xuất kho</h3>
        <div class="form-grid">
            <div class="form-group">
                <label for="quantity">Số lượng xuất</label>
                <input 
                id="quantity" 
                type="number" 
                v-model.number="formData.quantity" 
                min="1"
                :max="selectedInboundDetail.quantityAvailable"
                />
                <p v-if="errors.quantity" class="error-message">{{ errors.quantity }}</p>
            </div>

            <div class="form-group">
                <label for="shippingMethod">Phương thức vận chuyển</label>
                <select id="shippingMethod" v-model="formData.shippingMethod">
                <option disabled value="">Chọn phương thức</option>
                <option v-for="sm in dictionaryStore.shippingMethods" :key="sm.code" :value="sm.code">
                    {{ sm.name }}
                </option>
                </select>
                <p v-if="errors.shippingMethod" class="error-message">{{ errors.shippingMethod }}</p>
            </div>

            <div class="form-group">
                <label for="shippingDate">Ngày xuất</label>
                <input id="shippingDate" type="date" v-model="formData.shippingDate"/>
                <p v-if="errors.shippingDate" class="error-message">{{ errors.shippingDate }}</p>
            </div>
        </div>

        <p v-if="errors.general" class="error-message">{{ errors.general }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang tạo...' : 'Xác nhận Xuất kho' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-container { max-width: 800px; margin: auto; padding: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.outbound-form { margin-top: 2rem; }
.form-title { border-top: 1px solid #eee; padding-top: 2rem; }
.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select { width: 100%; padding: 0.75rem; box-sizing: border-box; }
.error-message { color: red; font-size: 0.875rem; margin-top: 4px; }
.form-actions { margin-top: 2rem; }
</style>