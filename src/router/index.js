import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard' // Chuyển hướng trang chủ đến trang profile
    },
    {
      path: '/dashboard', // <-- Route mới
      name: 'dashboard',
      component: () => import('../views/dashboard/DashboardView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { layout: 'AuthLayout' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { layout: 'AuthLayout' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/user/ProfileView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },
    {
      path: '/inbounds',
      name: 'inbound-list',
      component: () => import('../views/inbound/InboundListView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && authStore.credentials) {
    await authStore.tryAutoLogin();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'profile' });
  } else {
    next();
  }
});

export default router;
