// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

// Layouts
import AdminLayout from '@/layouts/AdminLayout.vue'

// Pages
import HomePage from '@/views/customer/HomePage.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import AdminDashboard from '@/views/admin/Dashboard.vue'

const routes = [
  // Customer Routes
  { path: '/', name: 'Home', component: HomePage },
  { path: '/my-tickets', component: () => import('@/views/customer/MyTickets.vue'), meta: { requiresAuth: true } },
  { path: '/booking/:tripId', component: () => import('@/views/customer/Booking.vue'), meta: { requiresAuth: true } },

  // Auth
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guest: true } },

  // Admin Routes - DÙNG LAYOUT RIÊNG
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'users', component: () => import('@/views/admin/UserManagementView.vue') },
      { path: 'buses', component: () => import('@/views/admin/BusManagementView.vue') },
      { path: 'routes', component: () => import('@/views/admin/RouteManagementView.vue') },
      { path: 'trips', component: () => import('@/views/admin/TripManagementView.vue') },
      { path: 'tickets', component: () => import('@/views/admin/TicketManagementView.vue') },
      { path: 'payments', component: () => import('@/views/admin/PaymentManagementView.vue') },
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Nếu vào trang admin nhưng không phải admin → đá về login
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/login')
  }
  // Nếu cần đăng nhập nhưng chưa login
  else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  }
  // Nếu đã login rồi mà vào login/register → đẩy về trang phù hợp
  else if (to.meta.guest && authStore.isAuthenticated) {
    authStore.isAdmin ? next('/admin') : next('/')
  }
  else {
    next()
  }
})

export default router