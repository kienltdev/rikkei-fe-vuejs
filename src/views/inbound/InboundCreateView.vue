<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import inboundApi from '@/api/inbound.js';
import InboundForm from '@/components/specific/InboundForm.vue';

const router = useRouter();
const isLoading = ref(false);
const formErrors = ref({}); 

const handleCreate = async (formData) => {
  isLoading.value = true;
  formErrors.value = {};
  try {
    await inboundApi.createInbound(formData);
    alert('Tạo phiếu nhập thành công!');
    router.push({ name: 'inbound-list' });
  } catch (err) {
    if (err.response?.data?.code === 'VALIDATION_ERROR') {
      for (const validationError of err.response.data.validationErrors) {
        formErrors.value[validationError.field] = validationError.message;
      }
    } else {
      formErrors.value.general = err.response?.data?.message || 'Đã có lỗi xảy ra.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <h1>Tạo mới Phiếu nhập kho</h1>
    <InboundForm 
      @submit="handleCreate" 
      :is-loading="isLoading"
      :errors="formErrors"
    />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
}
</style>