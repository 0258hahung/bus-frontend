<!-- src/components/admin/AdminSidebar.vue -->
<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <h1 class="sidebar-title">🎓 FUTA Admin</h1>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'active': isActiveRoute(item.to) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button @click="logout" class="logout-btn">
        <span class="logout-icon">🚪</span>
        <span>Đăng xuất</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: '🏠' },
  { to: '/admin/users', label: 'Người dùng', icon: '👥' },
  { to: '/admin/buses', label: 'Xe buýt', icon: '🚌' },
  { to: '/admin/routes', label: 'Tuyến xe', icon: '🛣️' },
  { to: '/admin/trips', label: 'Chuyến xe', icon: '🕐' },
  { to: '/admin/tickets', label: 'Vé đã đặt', icon: '🎫' },
  { to: '/admin/payments', label: 'Thanh toán', icon: '💰' },
]

const isActiveRoute = (path) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

const logout = () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 256px;
  height: 100vh;
  background: linear-gradient(180deg, #ea580c 0%, #c2410c 100%);
  color: white;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 24px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px 32px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
  font-weight: 500;
  font-size: 15px;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.15);
  color: white;
  border-left-color: white;
}

.nav-item.active {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  border-left-color: white;
  font-weight: 700;
}

.nav-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.nav-label {
  flex: 1;
}

.sidebar-footer {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  padding: 14px 20px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  background: rgba(220, 38, 38, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}

.logout-icon {
  font-size: 18px;
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .admin-sidebar.open {
    transform: translateX(0);
  }
}
</style>