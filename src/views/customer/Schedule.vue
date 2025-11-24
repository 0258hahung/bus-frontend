<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="schedule-page">
      <div class="container">
        <h1 class="page-title">🗓️ Lịch Trình Xe</h1>
        <p class="page-subtitle">Xem lịch trình các chuyến xe trong tuần</p>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Đang tải lịch trình...</p>
        </div>

        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div v-else class="schedule-content">
          <!-- Filter -->
          <div class="filter-card">
            <div class="filter-row">
              <div class="filter-item">
                <label>Tuyến đường:</label>
                <select v-model="selectedRoute" class="form-select" @change="loadSchedule">
                  <option value="">Tất cả</option>
                  <option v-for="route in routes" :key="route.routeId" :value="route.routeId">
                    {{ route.departure }} → {{ route.destination }}
                  </option>
                </select>
              </div>

              <div class="filter-item">
                <label>Từ ngày:</label>
                <input v-model="startDate" type="date" class="form-input" @change="loadSchedule" />
              </div>
            </div>
          </div>

          <!-- Schedule Table -->
          <div class="schedule-table">
            <table>
              <thead>
                <tr>
                  <th>Mã chuyến</th>
                  <th>Tuyến đường</th>
                  <th>Giờ đi</th>
                  <th>Giờ đến</th>
                  <th>Biển số xe</th>
                  <th>Ghế trống</th>
                  <th>Giá vé</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="trip in trips" :key="trip.tripId">
                  <td><strong>#{{ trip.tripId }}</strong></td>
                  <td>{{ trip.routeInfo }}</td>
                  <td>{{ formatDateTime(trip.departureTime) }}</td>
                  <td>{{ formatDateTime(trip.arrivalTime) }}</td>
                  <td>{{ trip.licensePlate }}</td>
                  <td><span class="seats-badge">{{ trip.availableSeats || 0 }}</span></td>
                  <td><strong class="price">{{ formatPrice(trip.price) }}</strong></td>
                  <td><span :class="['status-badge', getStatusClass(trip.status)]">{{ getStatusText(trip.status) }}</span></td>
                  <td>
                    <router-link 
                      v-if="trip.status === 'SCHEDULED'" 
                      :to="`/booking/${trip.tripId}`" 
                      class="btn-book"
                    >
                      Đặt vé
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="trips.length === 0" class="no-schedule">
            <div class="icon">📅</div>
            <p>Không có lịch trình nào</p>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import api from '@/services/api'

const trips = ref([])
const routes = ref([])
const loading = ref(false)
const error = ref('')
const selectedRoute = ref('')
const startDate = ref(new Date().toISOString().split('T')[0])

onMounted(async () => {
  await loadRoutes()
  await loadSchedule()
})

const loadRoutes = async () => {
  try {
    const res = await api.get('/routes')
    routes.value = res.data.data || []
  } catch (err) {
    console.error('Error loading routes:', err)
  }
}

const loadSchedule = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await api.get('/trips')
    let allTrips = res.data.data || []
    
    // Filter by route if selected
    if (selectedRoute.value) {
      allTrips = allTrips.filter(t => t.routeId === Number(selectedRoute.value))
    }
    
    // Filter by date
    const filterDate = new Date(startDate.value)
    allTrips = allTrips.filter(t => {
      const tripDate = new Date(t.departureTime)
      return tripDate >= filterDate
    })
    
    // Sort by departure time
    allTrips.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime))
    
    trips.value = allTrips
  } catch (err) {
    console.error('Error loading schedule:', err)
    error.value = 'Lỗi tải lịch trình'
  } finally {
    loading.value = false
  }
}

const formatDateTime = (time) => {
  if (!time) return 'N/A'
  return new Date(time).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('vi-VN') + ' đ'
}

const getStatusClass = (status) => {
  const map = {
    'SCHEDULED': 'success',
    'RUNNING': 'info',
    'FINISHED': 'default',
    'CANCELLED': 'danger'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    'SCHEDULED': 'Sẵn sàng',
    'RUNNING': 'Đang chạy',
    'FINISHED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy'
  }
  return map[status] || status
}
</script>

<style scoped>
.schedule-page {
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
  background: var(--gray-50);
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--gray-600);
  margin-bottom: 32px;
}

.filter-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.filter-item label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.schedule-table {
  background: white;
  border-radius: 10px;
  box-shadow: var(--shadow);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: var(--gray-50);
  padding: 14px 16px;
  text-align: left;
  font-weight: 700;
  font-size: 13px;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--gray-200);
  font-size: 14px;
}

tr:hover {
  background: var(--gray-50);
}

.seats-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}

.price {
  color: var(--primary-color);
  font-size: 15px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.default {
  background: var(--gray-200);
  color: var(--gray-700);
}

.btn-book {
  background: var(--primary-color);
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-book:hover {
  background: var(--primary-dark);
}

.no-schedule {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 10px;
}

.no-schedule .icon {
  font-size: 64px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .schedule-table {
    font-size: 12px;
  }
  
  th, td {
    padding: 10px;
  }
}
</style>