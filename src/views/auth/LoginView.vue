<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';


const router = useRouter();
const authStore = useAuthStore();


const username = ref('');
const password = ref('');

const error = ref(null);
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = null;
  isLoading.value = true;

  try {
    await authStore.login(username.value, password.value);

    router.push('/profile');
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    }
    console.error("Login failed:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-card">
    <h2 class="title">Đăng nhập Hệ thống</h2>
    <p class="subtitle">Vui lòng nhập thông tin tài khoản của bạn.</p>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Tên đăng nhập</label>
        <input
          id="username"
          type="text"
          v-model="username"
          placeholder="ví dụ: kien.le"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="password">Mật khẩu</label>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="••••••••"
          :disabled="isLoading"
        />
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>

      <button type="submit" class="submit-button" :disabled="isLoading">
        <span v-if="isLoading">Đang xử lý...</span>
        <span v-else>Đăng nhập</span>
      </button>
    </form>

    <p class="register-link">
      Chưa có tài khoản?
      <router-link to="/register">Đăng ký ngay</router-link>
    </p>
  </div>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 380px;
  padding: 2.5rem;
  box-sizing: border-box;
}

.title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.submit-button {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #555;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
