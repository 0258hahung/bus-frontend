<template>
  <div class="sidebar">
    <div class="logo">FUTA Admin</div>
    <nav class="menu">
      <router-link to="/admin" exact class="menu-item">Dashboard</router-link>
      <router-link to="/admin/users" class="menu-item">Người dùng</router-link>
      <router-link to="/admin/buses" class="menu-item">Xe</router-link>
      <router-link to="/admin/routes" class="menu-item">Tuyến xe</router-link>
      <router-link to="/admin/trips" class="menu-item">Chuyến xe</router-link>
      <router-link to="/admin/tickets" class="menu-item">Vé đặt</router-link>
      <router-link to="/admin/payments" class="menu-item">Thanh toán</router-link>
    </nav>
    <button @click="logout" class="logout-btn">Đăng xuất</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore.js'
const router = useRouter()
const authStore = useAuthStore()
const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #e86c1c;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}
.logo {
  padding: 25px 20px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  background: #d35400;
  border-bottom: 3px solid #c0392b;
}
.menu {
  flex: 1;
  padding: 20px 0;
}
.menu-item {
  display: block;
  padding: 15px 25px;
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s;
}
.menu-item:hover, .menu-item.router-link-active {
  background: #d35400;
  padding-left: 35px;
}
.logout-btn {
  margin: 20px;
  padding: 12px;
  background: #c0392b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}
.logout-btn:hover { background: #e74c3c; }
</style>