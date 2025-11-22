<!-- src/views/admin/Tickets.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar tùy chỉnh cho admin -->
    <nav class="bg-white shadow sticky top-0 z-50">
      <div class="container mx-auto flex justify-between items-center p-4">
        <div class="flex items-center gap-4">
          <router-link to="/admin" class="text-gray-600 hover:text-orange-500">
            ← Dashboard
          </router-link>
          <h1 class="text-2xl font-bold text-orange-500">Quản Lý Vé</h1>
        </div>
        <button @click="handleLogout" class="primary-btn bg-red-500">
          Đăng Xuất
        </button>
      </div>
    </nav>

    <div class="container py-12">
      <h2 class="text-3xl font-bold mb-8">Quản Lý Vé</h2>

      <div class="space-y-4">
        <div v-for="ticket in tickets" :key="ticket.ticketId" class="card">
          <h3 class="text-xl font-bold">Mã vé: {{ ticket.ticketCode }}</h3>
          <p>Người dùng: {{ ticket.user.fullName }}</p>
          <p>Chuyến: {{ ticket.trip.route.from }} → {{ ticket.trip.route.to }}</p>
          <p>Thời gian: {{ formatTime(ticket.trip.departureTime) }}</p>
          <p>Ghế: {{ ticket.seat.seatNumber }}</p>
          <p>Giá: {{ formatPrice(ticket.price) }} VND</p>
          <p>Trạng thái: {{ ticket.status }}</p>
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

const tickets = ref([])

onMounted(async () => {
  const res = await api.get('/tickets/admin/all')
  tickets.value = res.data.data || []
})

const formatTime = (time) => {
  return new Date(time).toLocaleString('vi-VN')
}

const formatPrice = (price) => {
  return price.toLocaleString('vi-VN')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>