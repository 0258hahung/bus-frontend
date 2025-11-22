<!-- src/views/admin/Payments.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar tùy chỉnh cho admin -->
    <nav class="bg-white shadow sticky top-0 z-50">
      <div class="container mx-auto flex justify-between items-center p-4">
        <div class="flex items-center gap-4">
          <router-link to="/admin" class="text-gray-600 hover:text-orange-500">
            ← Dashboard
          </router-link>
          <h1 class="text-2xl font-bold text-orange-500">Quản Lý Thanh Toán</h1>
        </div>
        <button @click="handleLogout" class="primary-btn bg-red-500">
          Đăng Xuất
        </button>
      </div>
    </nav>

    <div class="container py-12">
      <h2 class="text-3xl font-bold mb-8">Quản Lý Thanh Toán</h2>

      <div class="space-y-4">
        <div v-for="payment in payments" :key="payment.paymentId" class="card">
          <h3 class="text-xl font-bold">Mã thanh toán: {{ payment.paymentCode }}</h3>
          <p>Vé: {{ payment.ticket.ticketCode }}</p>
          <p>Số tiền: {{ formatPrice(payment.amount) }} VND</p>
          <p>Phương thức: {{ payment.method }}</p>
          <p>Trạng thái: {{ payment.status }}</p>
          <p>Thời gian: {{ formatTime(payment.createdAt) }}</p>
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

const payments = ref([])

onMounted(async () => {
  const res = await api.get('/payments/admin/all')
  payments.value = res.data.data || []
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