<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// --- 1. Định nghĩa cấu trúc menu trong script ---
// Điều này giúp quản lý menu dễ dàng hơn rất nhiều
const navLinks = ref([
  { to: '/dashboard', text: 'Tổng quan', requiredRole: null }, // null = ai cũng thấy
  { to: '/inbounds', text: 'Quản lý Nhập kho', requiredRole: null },
  { to: '/inbound-statistics', text: 'Thống kê Nhập kho', requiredRole: null },
  { to: '/inventory', text: 'Quản lý Tồn kho', requiredRole: null },
  { to: '/outbounds', text: 'Quản lý Xuất kho', requiredRole: null },
  { to: '/monthly-report', text: 'Báo cáo tháng', requiredRole: 1 }, // 1 = chỉ Admin thấy
])

// --- 2. Lọc menu dựa trên vai trò của người dùng ---
// Logic phân quyền được xử lý tập trung và sạch sẽ
const filteredNavLinks = computed(() => {
  const userRole = authStore.currentUser?.role
  if (!userRole) return [] // Nếu chưa đăng nhập, không hiển thị menu nào

  return navLinks.value.filter((link) => {
    // Nếu link không yêu cầu vai trò cụ thể, hoặc vai trò người dùng khớp với yêu cầu
    return link.requiredRole === null || link.requiredRole === userRole
  })
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="default-layout">
    <header class="app-header">
      <div class="header-content">
        <!-- Phần Logo/Tên hệ thống -->
        <div class="brand">
          <router-link to="/dashboard">
            <h1>Hệ Thống Quản Lý Kho</h1>
          </router-link>
        </div>

        <!-- Phần Menu chính (nếu đã đăng nhập) -->
        <nav v-if="authStore.isAuthenticated" class="main-nav">
          <!-- 3. Dùng v-for để render menu -->
          <router-link v-for="link in filteredNavLinks" :key="link.to" :to="link.to">
            {{ link.text }}
          </router-link>
        </nav>

        <!-- Phần Menu người dùng (nếu đã đăng nhập) -->
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <details class="dropdown">
            <summary class="dropdown-toggle">
              <span>Chào, {{ authStore.currentUser?.fullName || authStore.currentUser?.username }}</span>
              <span class="arrow">▼</span>
            </summary>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/profile" class="dropdown-item">Hồ sơ của bạn</router-link>
              </li>
              <li>
                <button @click="handleLogout" class="dropdown-item logout-button">
                  Đăng xuất
                </button>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
/* --- 4. CSS được làm mới hoàn toàn --- */
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.app-header {
  background-color: #001529;
  color: white;
  padding: 0 2rem;
  box-shadow: 0 2px 8px #f0f1f2;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.brand a {
  color: white;
  text-decoration: none;
}

.main-nav {
  display: flex;
  gap: 1.5rem;
  flex-grow: 1;
  margin-left: 3rem;
}

.main-nav a {
  color: #c1c1c1;
  text-decoration: none;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s;
}

.main-nav a:hover,
.main-nav a.router-link-exact-active {
  color: white;
}

/* Gạch chân cho link active */
.main-nav a.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #1890ff;
}

.user-menu {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  list-style: none; /* Loại bỏ dấu chấm của summary */
}
.dropdown-toggle::-webkit-details-marker {
  display: none; /* Ẩn mũi tên mặc định của details */
}

.dropdown-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.arrow {
  font-size: 0.7rem;
  transition: transform 0.2s;
}

.dropdown[open] .arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  color: #333;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  list-style: none;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  min-width: 180px;
  z-index: 11;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1.25rem;
  text-align: left;
  text-decoration: none;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.dropdown-item:hover {
  background-color: #f0f2f5;
}

.logout-button {
  color: #d9534f; /* Màu đỏ cho nút nguy hiểm */
}

.app-main {
  padding: 2rem;
  flex-grow: 1;
}
</style>