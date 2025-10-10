<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import inboundApi from '@/api/inbound.js';
import InboundForm from '@/components/specific/InboundForm.vue';
import { useDictionaryStore } from '@/stores/dictionary';

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const dictionaryStore = useDictionaryStore();
const isLoading = ref(false);
const initialData = ref({});
const pageError = ref(null);
const formErrors = ref({}); // <-- THÊM DÒNG NÀY: Tạo ref để lưu lỗi của form

const loadAllData = async () => {
  isLoading.value = true;
  pageError.value = null;
  try {
    await dictionaryStore.fetchDictionaries();
    const response = await inboundApi.getInboundDetail(props.id);
    initialData.value = response.data;
    
    if (!initialData.value.editable) {
        alert("Phiếu nhập này không thể chỉnh sửa.");
        router.back();
    }
  } catch (err) {
    console.error("Failed to load data for editing:", err);
    pageError.value = "Không thể tải dữ liệu phiếu nhập.";
  } finally {
    isLoading.value = false;
  }
};

// SỬA LẠI HÀM NÀY
const handleUpdate = async (formData) => { // Bỏ errorsRef từ tham số
  isLoading.value = true;
  formErrors.value = {}; // Xóa lỗi cũ từ ref của component cha
  try {
    await inboundApi.updateInbound(props.id, formData);
    alert('Cập nhật phiếu nhập thành công!');
    router.push({ name: 'inbound-list' });
  } catch (err) {
    if (err.response?.data?.code === 'VALIDATION_ERROR') {
      // Gán lỗi vào ref của component cha
      for (const validationError of err.response.data.validationErrors) {
        formErrors.value[validationError.field] = validationError.message;
      }
    } else {
      // Gán lỗi chung vào ref của component cha
      formErrors.value.general = err.response?.data?.message || 'Đã có lỗi xảy ra.';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadAllData);
</script>

<template>
  <div class="page-container">
    <h1>Chỉnh sửa Phiếu nhập #{{ id }}</h1>
    <div v-if="pageError">{{ pageError }}</div>
    <div v-else-if="isLoading && !initialData.invoice">Đang tải dữ liệu...</div> 
    <InboundForm 
      v-else
      :initial-data="initialData" 
      :errors="formErrors"  
      is-edit-mode 
      @submit="handleUpdate" 
      :is-loading="isLoading" 
    />
  </div>
</template>