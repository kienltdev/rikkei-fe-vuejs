<script setup>
import { ref } from 'vue';
import inboundApi from '@/api/inbound.js';

defineProps({
  modelValue: { type: Boolean, required: true },
});
const emit = defineEmits(['update:modelValue', 'import-success']);

// --- State ---
const selectedFile = ref(null);
const isUploading = ref(false);
const importResult = ref(null); // Lưu kết quả trả về từ API
const error = ref(null);

// --- Logic ---
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  importResult.value = null;
  error.value = null;
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    alert('Vui lòng chọn một file.');
    return;
  }

  isUploading.value = true;
  importResult.value = null;
  error.value = null;

  try {
    const response = await inboundApi.importInbounds(selectedFile.value);
    importResult.value = response.data;
    emit('import-success');
  } catch (err) {
    error.value = err.response?.data?.message || 'Upload file thất bại. Vui lòng kiểm tra lại định dạng file.';
    console.error("Import failed:", err);
  } finally {
    isUploading.value = false;
  }
};

const closeModal = () => {
  selectedFile.value = null;
  isUploading.value = false;
  importResult.value = null;
  error.value = null;
  emit('update:modelValue', false);
};
</script>

<template>
  <!-- Lớp phủ nền mờ -->
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">&times;</button>

      <h2>Import Phiếu Nhập Kho</h2>

      <!-- Phần Upload File -->
      <div v-if="!importResult">
        <p>Chọn file CSV hoặc Excel (.xlsx) để import hàng loạt.</p>
        <div class="file-input-wrapper">
          <input type="file" id="file-upload" @change="handleFileChange" accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
          <label for="file-upload">{{ selectedFile ? selectedFile.name : 'Chọn file...' }}</label>
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button class="upload-button" @click="handleUpload" :disabled="!selectedFile || isUploading">
          {{ isUploading ? 'Đang tải lên...' : 'Tải lên và Import' }}
        </button>
      </div>

      <!-- Phần Hiển thị Kết quả -->
      <div v-else class="result-section">
        <h3>Kết quả Import</h3>
        <p><strong>Tổng số dòng xử lý:</strong> {{ importResult.totalRows }}</p>
        <p class="success-text"><strong>Thành công:</strong> {{ importResult.successCount }}</p>
        <p class="error-text"><strong>Thất bại:</strong> {{ importResult.failureCount }}</p>

        <div v-if="importResult.failureCount > 0" class="error-details">
          <h4>Chi tiết lỗi:</h4>
          <ul>
            <li v-for="(err, index) in importResult.errorDetails" :key="index">
              <strong>Dòng {{ err.rowNumber }}:</strong> {{ err.message }}
            </li>
          </ul>
        </div>
        <button @click="closeModal" class="btn-primary">Đóng</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.file-input-wrapper {
  margin: 1.5rem 0;
}
.upload-button {
  width: 100%;
  padding: 0.75rem;
  /* ... style khác ... */
}
.result-section {
  margin-top: 1.5rem;
}
.success-text { color: green; }
.error-text, .error-message { color: red; }
.error-details {
  margin-top: 1rem;
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 1rem;
  max-height: 150px;
  overflow-y: auto;
}

.btn-primary {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-weight: 500;
}
.btn-primary:hover {
  background-color: #0056b3;
}
</style>
