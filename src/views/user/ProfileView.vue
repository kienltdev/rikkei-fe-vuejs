<script setup>
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { currentUser } = storeToRefs(authStore);

const isEditing = ref(false);
const editableProfile = ref({});
const errors = ref({});
const successMessage = ref('');

onMounted(() => {
  if (currentUser.value) {
    editableProfile.value = { ...currentUser.value };
  }
});

watch(currentUser, (newUser) => {
  if (newUser) {
    editableProfile.value = { ...newUser };
  }
});

const handleUpdate = async () => {
  errors.value = {};
  successMessage.value = '';
  try {
    const dataToUpdate = {
      fullName: editableProfile.value.fullName,
      email: editableProfile.value.email
    };
    await authStore.updateProfile(dataToUpdate);
    successMessage.value = 'Cập nhật hồ sơ thành công!';
    isEditing.value = false;
  } catch (err) {
    if (err.response && err.response.data) {
      const responseData = err.response.data;
      if (responseData.code === 'VALIDATION_ERROR' && responseData.validationErrors) {
        for (const validationError of responseData.validationErrors) {
          errors.value[validationError.field] = validationError.message;
        }
      } else {
        errors.value.general = responseData.message || 'Lỗi cập nhật hồ sơ.';
      }
    } else {
      errors.value.general = 'Không thể kết nối đến máy chủ.';
    }
  }
};

const cancelEdit = () => {
  editableProfile.value = { ...currentUser.value };
  isEditing.value = false;
  errors.value = {};
}
</script>

<template>
  <div class="profile-page">
    <h2>Hồ sơ cá nhân</h2>
    <div v-if="currentUser">
      <!-- ... phần hiển thị thông tin không đổi ... -->
      <div v-if="!isEditing">
        <p><strong>Tên đăng nhập:</strong> {{ currentUser.username }}</p>
        <p><strong>Họ và tên:</strong> {{ currentUser.fullName }}</p>
        <p><strong>Email:</strong> {{ currentUser.email }}</p>
        <p><strong>Vai trò:</strong> {{ currentUser.role === 1 ? 'Admin' : 'Staff' }}</p>
        <button @click="isEditing = true">Chỉnh sửa</button>
      </div>

      <!-- Chế độ chỉnh sửa -->
      <form v-else @submit.prevent="handleUpdate">
        <div>
          <label>Họ và tên:</label>
          <input type="text" v-model="editableProfile.fullName" />
          <p v-if="errors.fullName" class="error-message">{{ errors.fullName }}</p>
        </div>
        <div>
          <label>Email:</label>
          <input type="email" v-model="editableProfile.email" />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <p v-if="errors.general" class="error-message">{{ errors.general }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>

        <button type="submit">Lưu thay đổi</button>
        <button type="button" @click="cancelEdit">Hủy</button>
      </form>
    </div>
    <div v-else>
      <p>Đang tải thông tin...</p>
    </div>
  </div>
</template>

<style scoped>
.error-message { color: red; font-size: 0.875rem; }
.success { color: green; }
</style>
