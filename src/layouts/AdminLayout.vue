<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="admin-wrapper">
    <AdminSidebar />
    
    <div class="admin-container">
      <div class="admin-header">
        <h1>{{ pageTitle }}</h1>
      </div>
      
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    '/admin': 'Dashboard',
    '/admin/users': 'Quản lý Người dùng',
    '/admin/buses': 'Quản lý Xe buýt',
    '/admin/routes': 'Quản lý Tuyến xe',
    '/admin/trips': 'Quản lý Chuyến xe',
    '/admin/tickets': 'Quản lý Vé đã đặt',
    '/admin/payments': 'Quản lý Thanh toán',
  }
  return titles[route.path] || 'Admin Panel'
})
</script>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}
</style>