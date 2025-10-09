<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  username: '',
  password: '',
  fullName: '',
  email: ''
});

const errors = ref({});

const handleRegister = async () => {
  errors.value = {};
  try {
    await authStore.register(formData.value);
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    router.push('/login');
  } catch (err) {
    if (err.response && err.response.data) {
      const responseData = err.response.data;
      if (responseData.code === 'VALIDATION_ERROR' && responseData.validationErrors) {
        for (const validationError of responseData.validationErrors) {
          errors.value[validationError.field] = validationError.message;
        }
      } else {
        errors.value.general = responseData.message || 'Đã có lỗi xảy ra.';
      }
    } else {
      errors.value.general = 'Không thể kết nối đến máy chủ.';
    }
    console.error(err);
  }
};
</script>

<template>
  <div class="register-form">
    <h2>Đăng ký</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="username">Tên đăng nhập:</label>
        <input id="username" type="text" v-model="formData.username"  />
        <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
      </div>
      <div>
        <label for="password">Mật khẩu:</label>
        <input id="password" type="password" v-model="formData.password"  />
        <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
      </div>
      <div>
        <label for="fullName">Họ và tên:</label>
        <input id="fullName" type="text" v-model="formData.fullName" />
        <p v-if="errors.fullName" class="error-message">{{ errors.fullName }}</p>
      </div>
      <div>
        <label for="email">Email:</label>
        <input id="email" type="email" v-model="formData.email"  />
        <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
      </div>

      <p v-if="errors.general" class="error-message">{{ errors.general }}</p>

      <button type="submit">Đăng ký</button>
    </form>
    <p>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
  </div>
</template>

<style scoped>
.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 4px;
}
.register-form div {
  margin-bottom: 1rem;
}
</style>
