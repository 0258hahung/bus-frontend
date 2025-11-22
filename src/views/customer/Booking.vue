<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="booking-page">
      <div class="container">
        <div class="breadcrumb">
          <router-link to="/" class="back-link">
            ← Quay lại trang chủ
          </router-link>
        </div>

        <h1 class="page-title">Đặt Vé Xe Khách</h1>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Đang tải thông tin chuyến xe...</p>
        </div>

        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div v-else class="booking-container">
          <!-- Trip Info Card -->
          <div class="trip-info-card">
            <div class="trip-info-header">
              <h2>Thông tin chuyến xe</h2>
              <span class="badge badge-info">{{ trip.tripId }}</span>
            </div>
            <div class="trip-info-body">
              <div class="info-item">
                <span class="info-label">Tuyến đường:</span>
                <span class="info-value">{{ trip.routeName || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Giờ khởi hành:</span>
                <span class="info-value">{{ formatTime(trip.departureTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Loại xe:</span>
                <span class="info-value">{{ trip.busType || 'Giường nằm' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Giá vé:</span>
                <span class="info-value price">{{ formatPrice(trip.price) }} VNĐ</span>
              </div>
            </div>
          </div>

          <!-- Seat Selection -->
          <div class="seat-section">
            <h2 class="section-title">Chọn ghế ngồi</h2>
            
            <div v-for="floor in seatLayout.floors" :key="floor.name" class="floor-section">
              <h3 class="floor-title">{{ floor.name }}</h3>
              
              <div class="seats-grid">
                <button 
                  v-for="seat in floor.seats" 
                  :key="seat.seatId"
                  :class="getSeatClass(seat)"
                  :disabled="seat.status !== 'AVAILABLE'"
                  @click="selectSeat(seat)"
                  :title="`Ghế ${seat.seatNumber} - ${getSeatStatus(seat.status)}`"
                >
                  <span class="seat-number">{{ seat.seatNumber }}</span>
                </button>
              </div>
            </div>

            <!-- Legend -->
            <div class="seat-legend">
              <div class="legend-item">
                <div class="legend-box available"></div>
                <span>Còn trống</span>
              </div>
              <div class="legend-item">
                <div class="legend-box selected"></div>
                <span>Đã chọn</span>
              </div>
              <div class="legend-item">
                <div class="legend-box booked"></div>
                <span>Đã đặt</span>
              </div>
            </div>
          </div>

          <!-- Booking Summary -->
          <div v-if="selectedSeat" class="booking-summary">
            <h2 class="section-title">Thông tin đặt vé</h2>
            
            <div class="selected-seat-info">
              <div class="seat-badge">
                Ghế số: <strong>{{ selectedSeat.seatNumber }}</strong>
              </div>
              <div class="seat-details">
                <span>{{ selectedSeat.deck === 'A' ? 'Tầng dưới' : 'Tầng trên' }}</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Phương thức thanh toán</label>
              <select v-model="paymentMethod" class="form-select">
                <option value="CASH">💵 Tiền mặt - Thanh toán khi lên xe</option>
                <option value="VNPAY">💳 VNPay - Thanh toán online</option>
              </select>
              <small class="form-hint">
                {{ paymentMethod === 'CASH' ? 'Thanh toán trực tiếp cho tài xế' : 'Chuyển hướng đến cổng VNPay' }}
              </small>
            </div>

            <div class="price-summary">
              <div class="price-row">
                <span>Giá vé:</span>
                <span>{{ formatPrice(trip.price) }} VNĐ</span>
              </div>
              <div class="price-row total">
                <span>Tổng thanh toán:</span>
                <span>{{ formatPrice(trip.price) }} VNĐ</span>
              </div>
            </div>

            <button 
              @click="bookTicket" 
              class="btn btn-primary w-full"
              :disabled="bookingLoading"
            >
              <span v-if="bookingLoading">Đang xử lý...</span>
              <span v-else>🎫 Xác nhận đặt vé</span>
            </button>

            <p class="booking-note">
              * Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
            </p>
          </div>

          <!-- No seat selected -->
          <div v-else class="no-selection">
            <div class="no-selection-icon">🪑</div>
            <p>Vui lòng chọn ghế để tiếp tục</p>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const tripId = route.params.tripId
const trip = ref({})
const seatLayout = ref({ floors: [] })
const selectedSeat = ref(null)
const paymentMethod = ref('CASH')
const loading = ref(false)
const bookingLoading = ref(false)
const error = ref('')

onMounted(async () => {
  await loadTripData()
})

const loadTripData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Load trip info
    const tripRes = await api.get(`/trips/${tripId}`)
    trip.value = tripRes.data.data

    // Load seat layout
    const busId = trip.value.busId
    if (busId) {
      const seatsRes = await api.get(`/seats/layout/bus/${busId}`)
      seatLayout.value = seatsRes.data.data
    } else {
      throw new Error('Không tìm thấy thông tin xe')
    }
  } catch (err) {
    console.error('Error loading trip data:', err)
    error.value = err.response?.data?.message || 'Lỗi tải thông tin chuyến xe'
  } finally {
    loading.value = false
  }
}

const getSeatClass = (seat) => {
  const baseClass = 'seat-btn'
  if (seat.status === 'BOOKED') return `${baseClass} booked`
  if (selectedSeat.value?.seatId === seat.seatId) return `${baseClass} selected`
  return `${baseClass} available`
}

const getSeatStatus = (status) => {
  const statusMap = {
    'AVAILABLE': 'Còn trống',
    'BOOKED': 'Đã đặt',
    'SELECTED': 'Đang chọn'
  }
  return statusMap[status] || status
}

const selectSeat = (seat) => {
  if (seat.status === 'AVAILABLE') {
    selectedSeat.value = seat
  }
}

const bookTicket = async () => {
  if (!selectedSeat.value) {
    alert('Vui lòng chọn ghế')
    return
  }

  if (!confirm('Xác nhận đặt vé?')) return

  bookingLoading.value = true
  error.value = ''

  try {
    // Step 1: Book ticket
    const bookingRes = await api.post('/tickets/book', null, {
      params: {
        userId: authStore.user.userId,
        tripId: tripId,
        seatId: selectedSeat.value.seatId
      }
    })

    const ticketId = bookingRes.data.data.ticketId

    // Step 2: Create payment
    const paymentRes = await api.post(
      `/payments/create?ticketId=${ticketId}&method=${paymentMethod.value}`
    )

    // Step 3: Handle payment method
    if (paymentMethod.value === 'VNPAY' && paymentRes.data.vnpayUrl) {
      window.location.href = paymentRes.data.vnpayUrl
    } else {
      alert('Đặt vé thành công! Vui lòng thanh toán khi lên xe.')
      router.push('/my-tickets')
    }
  } catch (err) {
    console.error('Booking error:', err)
    error.value = err.response?.data?.message || 'Đặt vé thất bại. Vui lòng thử lại!'
    alert(error.value)
  } finally {
    bookingLoading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('vi-VN')
}
</script>

<style scoped>
.booking-page {
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
  background: var(--gray-50);
}

.breadcrumb {
  margin-bottom: 24px;
}

.back-link {
  color: var(--primary-color);
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.back-link:hover {
  transform: translateX(-4px);
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 32px;
  color: var(--gray-900);
}

.booking-container {
  display: grid;
  gap: 24px;
}

/* Trip Info Card */
.trip-info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.trip-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--gray-200);
}

.trip-info-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
}

.trip-info-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 13px;
  color: var(--gray-600);
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
}

.info-value.price {
  color: var(--primary-color);
  font-size: 20px;
}

/* Seat Section */
.seat-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--gray-900);
}

.floor-section {
  margin-bottom: 32px;
}

.floor-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--gray-700);
  padding: 8px 12px;
  background: var(--gray-100);
  border-radius: 6px;
  display: inline-block;
}

.seats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  max-width: 500px;
}

.seat-btn {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seat-btn.available {
  background: #3b82f6;
  color: white;
}

.seat-btn.available:hover {
  background: #2563eb;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.seat-btn.selected {
  background: #22c55e;
  color: white;
  border-color: #16a34a;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.seat-btn.booked {
  background: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
}

.seat-legend {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--gray-200);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--gray-700);
}

.legend-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.legend-box.available {
  background: #3b82f6;
}

.legend-box.selected {
  background: #22c55e;
}

.legend-box.booked {
  background: var(--gray-300);
}

/* Booking Summary */
.booking-summary {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.selected-seat-info {
  background: #dcfce7;
  border: 2px solid #22c55e;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin-bottom: 24px;
}

.seat-badge {
  font-size: 24px;
  font-weight: 800;
  color: #16a34a;
  margin-bottom: 8px;
}

.seat-details {
  font-size: 14px;
  color: #166534;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--gray-500);
}

.price-summary {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 15px;
}

.price-row.total {
  border-top: 2px solid var(--gray-300);
  padding-top: 12px;
  margin-top: 8px;
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-color);
}

.booking-note {
  margin-top: 16px;
  font-size: 13px;
  color: var(--gray-600);
  text-align: center;
  font-style: italic;
}

/* No Selection */
.no-selection {
  background: white;
  border-radius: 12px;
  padding: 60px 24px;
  box-shadow: var(--shadow);
  text-align: center;
  color: var(--gray-500);
}

.no-selection-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .seats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .seat-btn {
    font-size: 12px;
  }

  .trip-info-body {
    grid-template-columns: 1fr;
  }
}
</style>