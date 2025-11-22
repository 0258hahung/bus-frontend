<!-- src/views/admin/Users.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar tùy chỉnh cho admin -->
    <nav class="bg-white shadow sticky top-0 z-50">
      <div class="container mx-auto flex justify-between items-center p-4">
        <div class="flex items-center gap-4">
          <router-link to="/admin" class="text-gray-600 hover:text-orange-500">
            ← Dashboard
          </router-link>
          <h1 class="text-2xl font-bold text-orange-500">Quản Lý Người Dùng</h1>
        </div>
        <button @click="handleLogout" class="primary-btn bg-red-500">
          Đăng Xuất
        </button>
      </div>
    </nav>

    <div class="container py-12">
      <h2 class="text-3xl font-bold mb-8">Quản Lý Người Dùng</h2>

      <div class="space-y-4">
        <div v-for="user in users" :key="user.userId" class="card flex justify-between items-center">
          <div>
            <h3 class="text-xl font-bold">{{ user.fullName }}</h3>
            <p>Email: {{ user.email }}</p>
            <p>SĐT: {{ user.phone }}</p>
            <p>Vai trò: {{ user.role }}</p>
            <p>Trạng thái: {{ user.active ? 'Hoạt động' : 'Khóa' }}</p>
          </div>
          <div class="flex gap-2">
            <button v-if="user.active" @click="disableUser(user.userId)" class="primary-btn bg-red-500">Khóa</button>
            <button v-else @click="enableUser(user.userId)" class="primary-btn bg-green-500">Mở khóa</button>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore.js'
import api from '../../services/api.js'
import Footer from '@/components/Footer.vue'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])

onMounted(async () => {
  const res = await api.get('/users')
  users.value = res.data.data || []
})

const disableUser = async (id) => {
  if (confirm('Khóa tài khoản?')) {
    const res = await api.patch(`/users/${id}/disable`)
    users.value = users.value.map(u => u.userId === id ? res.data.data : u)
  }
}

const enableUser = async (id) => {
  if (confirm('Mở khóa?')) {
    const res = await api.patch(`/users/${id}/enable`)
    users.value = users.value.map(u => u.userId === id ? res.data.data : u)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>