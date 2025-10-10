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
    },
    {
      path: '/inbounds/:id', // :id là một tham số động
      name: 'inbound-detail',
      component: () => import('../views/inbound/InboundDetailView.vue'),
      props: true, // Tự động truyền :id vào làm prop cho component
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },
    {
      path: '/inbounds/create',
      name: 'inbound-create',
      component: () => import('../views/inbound/InboundCreateView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },
    {
      path: '/inbounds/edit/:id',
      name: 'inbound-edit',
      component: () => import('../views/inbound/InboundEditView.vue'),
      props: true, // Truyền :id vào làm prop
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },

    {
      path: '/inbound-statistics',
      name: 'inbound-statistics',
      component: () => import('../views/inbound/InboundStatisticsView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('../views/inventory/InventoryView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },
    {
      path: '/outbounds',
      name: 'outbound-list',
      component: () => import('../views/outbound/OutboundListView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true }
    },
    { 
    path: '/outbounds/create',
    name: 'outbound-create',
    component: () => import('../views/outbound/OutboundCreateView.vue'),
    meta: { layout: 'DefaultLayout', requiresAuth: true }
   },
   { 
    path: '/outbounds/:id',
    name: 'outbound-detail',
    component: () => import('../views/outbound/OutboundDetailView.vue'),
    props: true,
    meta: { layout: 'DefaultLayout', requiresAuth: true }
  },
  { 
    path: '/outbounds/edit/:id',
    name: 'outbound-edit',
    component: () => import('../views/outbound/OutboundEditView.vue'),
    props: true,
    meta: { layout: 'DefaultLayout', requiresAuth: true }
  },
  {
      path: '/monthly-report',
      name: 'monthly-report',
      component: () => import('../views/report/MonthlyReportView.vue'),
      meta: { layout: 'DefaultLayout', requiresAuth: true } 
    },
   
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
