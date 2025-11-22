import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

// Eager loading cho các trang quan trọng (không lazy)
import HomePage from '@/views/customer/HomePage.vue'
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

// Lazy loading cho các trang ít dùng
const MyTickets = () => import('@/views/customer/MyTickets.vue')
const Booking = () => import('@/views/customer/Booking.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { 
      title: 'Trang chủ - FUTA Bus Lines'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { 
      guest: true,
      title: 'Đăng nhập - FUTA Bus Lines'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { 
      guest: true,
      title: 'Đăng ký - FUTA Bus Lines'
    }
  },
  {
    path: '/my-tickets',
    name: 'MyTickets',
    component: MyTickets,
    meta: { 
      requiresAuth: true,
      title: 'Vé của tôi - FUTA Bus Lines'
    }
  },
  {
    path: '/booking/:tripId',
    name: 'Booking',
    component: Booking,
    meta: { 
      requiresAuth: true,
      title: 'Đặt vé - FUTA Bus Lines'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'instant' }
    }
  }
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  document.title = to.meta.title || 'FUTA Bus Lines'
  
  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } 
  else if (to.meta.guest && authStore.isAuthenticated) {
    next('/')
  } 
  else {
    next()
  }
})

export default router