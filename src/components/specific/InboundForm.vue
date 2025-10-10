<script setup>
// Phần script không thay đổi
import { ref, watch } from 'vue';
import { useDictionaryStore } from '@/stores/dictionary';
import { storeToRefs } from 'pinia';

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isEditMode: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['submit']);

const dictionaryStore = useDictionaryStore();
const { productTypes, supplierCodes } = storeToRefs(dictionaryStore);

const formData = ref({
  invoice: '',
  productType: '',
  supplierCd: '',
  receiveDate: '',
  quantity: null,
});

const handleSubmit = () => {
  const dataToSubmit = {
    ...formData.value,
    receiveDate: formatDateForApi(formData.value.receiveDate),
  };
  emit('submit', dataToSubmit);
};

const formatDateForApi = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return '';
};

watch(() => props.initialData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    formData.value = {
      invoice: newData.invoice || '',
      productType: newData.productType || '',
      supplierCd: newData.supplierCd || '',
      receiveDate: formatDateForInput(newData.receiveDate),
      quantity: newData.quantity || null,
    };
  }
}, { immediate: true, deep: true });
</script>

<template>
  <form @submit.prevent="handleSubmit" class="inbound-form">
    <div class="form-group">
      <label for="invoice">Hóa đơn</label>
      <input 
        id="invoice" 
        type="text" 
        v-model="formData.invoice" 
        placeholder="Nhập 9 chữ số" 
        maxlength="9" 
        pattern="\d{9}"
        title="Vui lòng nhập đúng 9 chữ số."
      />
      <p v-if="errors.invoice" class="error-message">{{ errors.invoice }}</p>
    </div>

    <div class="form-group">
      <label for="productType">Loại sản phẩm</label>
      <select id="productType" v-model="formData.productType">
        <option disabled value="">Chọn loại sản phẩm</option>
        <option v-for="pt in productTypes" :key="pt.code" :value="pt.code">{{ pt.name }}</option>
      </select>
      <p v-if="errors.productType" class="error-message">{{ errors.productType }}</p>
    </div>

    <div class="form-group">
      <label for="supplierCd">Nhà cung cấp</label>
      <select id="supplierCd" v-model="formData.supplierCd">
        <option disabled value="">Chọn nhà cung cấp</option>
        <option v-for="sc in supplierCodes" :key="sc.code" :value="sc.code">{{ sc.name }}</option>
      </select>
      <p v-if="errors.supplierCd" class="error-message">{{ errors.supplierCd }}</p>
    </div>

    <div class="form-group">
      <label for="receiveDate">Ngày nhận</label>
      <input id="receiveDate" type="date" v-model="formData.receiveDate" />
      <p v-if="errors.receiveDate" class="error-message">{{ errors.receiveDate }}</p>
    </div>

    <div class="form-group">
      <label for="quantity">Số lượng</label>
      <input 
        id="quantity" 
        type="number" 
        v-model.number="formData.quantity" 
        min="1"
        max="2147483647" 
        oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);"
        maxlength="10"
      />
      <p v-if="errors.quantity" class="error-message">{{ errors.quantity }}</p>
    </div>
    
    <p v-if="errors.general" class="error-message">{{ errors.general }}</p>

    <div class="form-actions">
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo mới') }}
      </button>
      <button type="button" @click="$router.back()">Hủy</button>
    </div>
  </form>
</template>

<style scoped>
/* Style không thay đổi */
.inbound-form { max-width: 600px; margin: auto; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; }
.form-group input, .form-group select { width: 100%; padding: 0.75rem; box-sizing: border-box; }
.error-message { color: red; font-size: 0.875rem; margin-top: 4px; }
.form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
</style>