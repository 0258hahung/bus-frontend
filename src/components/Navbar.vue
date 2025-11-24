<template>
  <header class="navbar">
    <div class="navbar-content">
      <div class="navbar-logo" @click="$router.push('/')">
        <span class="logo-main">FUTA</span>
        <span class="logo-sub">Bus</span>
      </div>

      <nav class="navbar-links">
        <router-link to="/" exact>Trang chủ</router-link>
        <router-link to="/schedule">Lịch trình</router-link>
        <router-link to="/track-ticket">Tra cứu vé</router-link>
      </nav>

      <div class="navbar-actions">
        <template v-if="authStore.isAuthenticated">
          <router-link to="/my-tickets" class="btn-link">
            🎫 Vé của tôi
          </router-link>
          <button @click="handleLogout" class="btn btn-outline-white">
            Đăng xuất
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="btn btn-outline-white">
            Đăng nhập
          </router-link>
          <router-link to="/register" class="btn btn-white">
            Đăng ký
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar {
  background: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.navbar-logo {
  cursor: pointer;
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.logo-main {
  color: white;
}

.logo-sub {
  background: white;
  color: var(--secondary-color);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 20px;
}

.navbar-links {
  display: flex;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.navbar-links a {
  color: white;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
  position: relative;
  padding: 8px 16px;
  border-radius: 8px;
}

.navbar-links a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.navbar-links a.router-link-active {
  background: white;
  color: var(--primary-color);
}

.navbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-link {
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-outline-white {
  background: transparent;
  border: 2px solid white;
  color: white;
  padding: 8px 20px;
}

.btn-outline-white:hover {
  background: white;
  color: var(--primary-color);
}

.btn-white {
  background: white;
  color: var(--primary-color);
  padding: 10px 24px;
}

.btn-white:hover {
  background: var(--gray-100);
}

@media (max-width: 768px) {
  .navbar-content {
    flex-wrap: wrap;
  }
  
  .navbar-links {
    order: 3;
    width: 100%;
    justify-content: space-around;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .navbar-links a {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>