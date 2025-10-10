<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import outboundApi from '@/api/outbound.js';
import { useDictionaryStore } from '@/stores/dictionary';

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const dictionaryStore = useDictionaryStore();
dictionaryStore.fetchDictionaries();

const formData = reactive({
  quantity: null,
  shippingMethod: '',
  shippingDate: '',
});

const inboundInfo = ref(null); // Để hiển thị thông tin phiếu nhập
const isLoading = ref(true);
const isSubmitting = ref(false);
const errors = ref({});

const loadOutboundData = async () => {
  isLoading.value = true;
  try {
    const response = await outboundApi.getOutboundDetail(props.id);
    const data = response.data;

    if (!data.editable) {
      alert("Phiếu xuất này không thể chỉnh sửa.");
      router.back();
      return;
    }

    // Điền dữ liệu vào form
    formData.quantity = data.quantity;
    formData.shippingMethod = data.shippingMethod;
    formData.shippingDate = data.shippingDate; // API trả về yyyy-MM-dd, khớp với input type="date"
    
    inboundInfo.value = data.inboundSummary;
  } catch (err) {
    errors.value.general = "Không thể tải dữ liệu phiếu xuất.";
  } finally {
    isLoading.value = false;
  }
};

const handleUpdate = async () => {
  isSubmitting.value = true;
  errors.value = {};
  try {
    await outboundApi.updateOutbound(props.id, formData);
    alert('Cập nhật phiếu xuất thành công!');
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

onMounted(loadOutboundData);
</script>

<template>
  <div class="page-container">
    <h1>Chỉnh sửa Phiếu xuất #{{ id }}</h1>

    <div v-if="isLoading">Đang tải...</div>
    <div v-else>
      <div v-if="inboundInfo" class="inbound-summary">
        <p>Phiếu xuất này thuộc Phiếu nhập có hóa đơn <strong>#{{ inboundInfo.invoice }}</strong>.</p>
        <p>Số lượng có thể xuất tối đa (đã bao gồm số lượng hiện tại): <strong>{{ inboundInfo.quantityAvailable + formData.quantity }}</strong></p>
      </div>

      <form @submit.prevent="handleUpdate" class="outbound-form">
        <div class="form-group">
          <label for="quantity">Số lượng xuất</label>
          <input 
            id="quantity" 
            type="number" 
            v-model.number="formData.quantity" 
            min="1"
            :max="inboundInfo ? inboundInfo.quantityAvailable + formData.quantity : undefined"
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

        <p v-if="errors.general" class="error-message">{{ errors.general }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang cập nhật...' : 'Cập nhật' }}
          </button>
          <button type="button" @click="$router.back()">Hủy</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-container { max-width: 600px; margin: auto; padding: 2rem; }
.inbound-summary {
  background: #f0f2f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
}
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select { width: 100%; padding: 0.75rem; box-sizing: border-box; }
.error-message { color: red; font-size: 0.875rem; margin-top: 4px; }
.form-actions { display: flex; gap: 1rem; }
</style>