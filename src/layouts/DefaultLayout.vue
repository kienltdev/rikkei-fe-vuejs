<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="default-layout">
    <header>
      <h1>Hệ Thống Quản Lý Kho</h1>
      <nav v-if="authStore.isAuthenticated">
        <span>Chào, {{ authStore.currentUser?.fullName || authStore.currentUser?.username }}!</span>
        <router-link to="/dashboard">Tổng quan</router-link>
        <router-link to="/inbounds">Quản lý Nhập kho</router-link>
        <router-link to="/inbound-statistics">Thống kê Nhập kho</router-link>
         <router-link to="/inventory">Quản lý Tồn kho</router-link>
        <router-link to="/outbounds">Quản lý Xuất kho</router-link> 
        <router-link v-if="authStore.currentUser?.role === 1" to="/monthly-report">Báo cáo tháng</router-link>
        <router-link to="/profile">Hồ sơ</router-link>
        <button @click="handleLogout">Đăng xuất</button>
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.default-layout {
  /* Thêm style cho layout chính sau */
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #001529;
  color: white;
}
nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
nav a, nav button {
  color: white;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
}
main {
  padding: 1rem;
}
</style>
