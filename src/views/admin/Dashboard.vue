<template>
  <div>
    <AdminSidebar />
    <div class="admin-container">
      <div class="admin-header">
        <h1>Dashboard</h1>
      </div>

      <div class="admin-content">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Tổng Chuyến Xe</h3>
            <div class="number">{{ totalTrips }}</div>
          </div>
          <div class="stat-card">
            <h3>Người Dùng</h3>
            <div class="number">{{ totalUsers }}</div>
          </div>
          <div class="stat-card">
            <h3>Tổng Xe</h3>
            <div class="number">{{ totalBuses }}</div>
          </div>
          <div class="stat-card">
            <h3>Doanh Thu</h3>
            <div class="number">{{ formatPrice(totalRevenue) }}đ</div>
          </div>
        </div>

        <div class="card">
          <h2 style="color:#e67e22;margin-top:0">Quản Lý Nhanh</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
            <router-link to="/admin/routes" class="btn btn-primary" style="text-align:center;padding:30px;font-size:18px;">
              Quản Lý Tuyến Xe
            </router-link>
            <router-link to="/admin/buses" class="btn btn-primary" style="text-align:center;padding:30px;font-size:18px;">
              Quản Lý Xe
            </router-link>
            <router-link to="/admin/trips" class="btn btn-primary" style="text-align:center;padding:30px;font-size:18px;">
              Quản Lý Chuyến Xe
            </router-link>
            <router-link to="/admin/users" class="btn btn-primary" style="text-align:center;padding:30px;font-size:18px;">
              Quản Lý Người Dùng
            </router-link>
            <router-link to="/admin/tickets" class="btn btn-primary" style="text-align:center;padding:30px;font-size:18px;">
              Quản Lý Vé
            </router-link>
            <router-link to="/admin/payments" class="btn btn-primary" style="text-align:center;padding:30px;font-size:18px;">
              Quản Lý Thanh Toán
            </router-link>
          </div>
        </div>

        <!-- Có thể thêm Recent Tickets, Upcoming Trips ở đây -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import api from '@/services/api.js'

const totalTrips = ref(0)
const totalUsers = ref(0)
const totalBuses = ref(0)
const totalRevenue = ref(0)

onMounted(async () => {
  try {
    const [t, u, b, p] = await Promise.all([
      api.get('/trips'), api.get('/users'), api.get('/buses'), api.get('/payments/admin/all')
    ])
    totalTrips.value = t.data.data?.length || 0
    totalUsers.value = u.data.data?.length || 0
    totalBuses.value = b.data.data?.length || 0
    totalRevenue.value = p.data.data?.reduce((s, x) => s + x.amount, 0) || 0
  } catch (e) { console.error(e) }
})

const formatPrice = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
</script>

<style scoped>
@import '@/assets/css/admin.css';
</style>