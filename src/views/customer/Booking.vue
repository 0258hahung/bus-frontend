<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="booking-page">
      <div class="container">
        <div class="breadcrumb">
          <router-link to="/" class="back-link">← Quay lại</router-link>
        </div>

        <h1 class="page-title">Đặt Vé Xe Khách</h1>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>

        <div v-else-if="error" class="alert alert-error">
          {{ error }}
          <button @click="loadTripData" class="btn btn-outline mt-2">Thử lại</button>
        </div>

        <div v-else class="booking-layout">
          <div class="left-col">
            <!-- Trip Info -->
            <div class="trip-card">
              <div class="trip-header">
                <h3>{{ trip.routeInfo || 'N/A' }}</h3>
                <span class="badge badge-info">#{{ trip.tripId }}</span>
              </div>
              <div class="trip-body">
                <div class="trip-row">
                  <span>🕐 Giờ đi:</span>
                  <strong>{{ formatTime(trip.departureTime) }}</strong>
                </div>
                <div class="trip-row">
                  <span>🚌 Loại xe:</span>
                  <strong>Giường nằm</strong>
                </div>
                <div class="trip-row">
                  <span>💰 Giá vé:</span>
                  <strong class="price">{{ formatPrice(trip.price) }} đ</strong>
                </div>
              </div>
            </div>

            <!-- Seats -->
            <div class="seats-card">
              <h3 class="card-title">
                Chọn ghế 
                <span class="hint">({{ availableSeatsCount }} ghế trống)</span>
              </h3>
              
              <div v-if="seatLayout.floors && seatLayout.floors.length > 0" class="floors">
                <div v-for="floor in seatLayout.floors" :key="floor.name" class="floor">
                  <div class="floor-name">{{ floor.name }}</div>
                  <div class="seats">
                    <button 
                      v-for="seat in floor.seats" 
                      :key="seat.seatId"
                      :class="getSeatClass(seat)"
                      :disabled="seat.status !== 'AVAILABLE'"
                      @click="selectSeat(seat)"
                      :title="getSeatTooltip(seat)"
                    >
                      {{ seat.seatNumber }}
                    </button>
                  </div>
                </div>

                <div class="legend">
                  <div class="leg-item">
                    <div class="dot avail"></div>
                    <span>Trống</span>
                  </div>
                  <div class="leg-item">
                    <div class="dot sel"></div>
                    <span>Đã chọn</span>
                  </div>
                  <div class="leg-item">
                    <div class="dot book"></div>
                    <span>Đã đặt</span>
                  </div>
                </div>
              </div>
              <div v-else class="alert alert-warning">Không tìm thấy ghế</div>
            </div>
          </div>

          <div class="right-col">
            <div v-if="selectedSeat" class="summary sticky">
              <h3 class="sum-title">Thông tin đặt vé</h3>
              
              <div class="seat-info">
                <div class="seat-num">Ghế <strong>{{ selectedSeat.seatNumber }}</strong></div>
                <div class="seat-deck">{{ selectedSeat.deck === 'A' ? 'Tầng dưới' : 'Tầng trên' }}</div>
              </div>

              <div class="form-group">
                <label>Phương thức thanh toán</label>
                <select v-model="paymentMethod" class="form-select">
                  <option value="CASH">💵 Tiền mặt (khi lên xe)</option>
                  <option value="VNPAY">💳 VNPay</option>
                  <option value="MOMO">🎀 MoMo</option>
                </select>
              </div>

              <div class="price-box">
                <div class="p-row">
                  <span>Giá vé:</span>
                  <span>{{ formatPrice(trip.price) }}</span>
                </div>
                <div class="p-row">
                  <span>Phí dịch vụ:</span>
                  <span>0 đ</span>
                </div>
                <div class="p-total">
                  <span>Tổng:</span>
                  <span>{{ formatPrice(trip.price) }} đ</span>
                </div>
              </div>

              <button 
                @click="bookTicket" 
                class="btn btn-primary w-full"
                :disabled="bookingLoading"
              >
                {{ bookingLoading ? 'Đang xử lý...' : '🎫 Xác nhận đặt vé' }}
              </button>

              <p class="note">* Kiểm tra kỹ thông tin trước khi xác nhận</p>
            </div>

            <div v-else class="summary empty">
              <div class="em-icon">🪑</div>
              <p>Chọn ghế để tiếp tục</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
let autoRefreshInterval = null

const availableSeatsCount = computed(() => {
  return seatLayout.value.floors?.flatMap(f => f.seats)
    .filter(s => s.status === 'AVAILABLE').length || 0
})

onMounted(async () => {
  await loadTripData()
  
  // Tự động làm mới ghế mỗi 10 giây
  autoRefreshInterval = setInterval(async () => {
    if (!bookingLoading.value) {
      await loadTripData(true) // silent refresh
    }
  }, 10000)
})

onUnmounted(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
})

const loadTripData = async (silent = false) => {
  if (!silent) loading.value = true
  error.value = ''
  
  try {
    // 1. Lấy thông tin chuyến xe
    const tripRes = await api.get(`/trips/${tripId}`)
    trip.value = tripRes.data.data

    const busId = trip.value.busId
    if (!busId) {
      throw new Error('Không tìm thấy thông tin xe')
    }

    // 2. Lấy layout ghế
    const seatsRes = await api.get(`/seats/layout/bus/${busId}`)
    const seatData = seatsRes.data.data
    
    // 3. ✅ LẤY TẤT CẢ VÉ VÀ LỌC GHẾ ĐÃ ĐẶT (PUBLIC API)
    try {
      const allTicketsRes = await api.get('/tickets/all')
      const allTickets = allTicketsRes.data.data
      
      // Lọc vé của chuyến này và chưa bị hủy
      const bookedSeatIds = new Set(
        allTickets
          .filter(t => t.tripId === parseInt(tripId) && t.status !== 'CANCELLED')
          .map(t => t.seatId)
      )
      
      console.log('📌 Ghế đã đặt:', Array.from(bookedSeatIds))
      
      // Cập nhật status ghế
      seatData.floors?.forEach(floor => {
        floor.seats.forEach(seat => {
          seat.status = bookedSeatIds.has(seat.seatId) ? 'BOOKED' : 'AVAILABLE'
        })
      })
      
      console.log('✅ Đã cập nhật trạng thái ghế')
      
    } catch (e) {
      console.error('❌ Lỗi khi lấy ghế đã đặt:', e)
      // Nếu API lỗi, tất cả ghế đều AVAILABLE (fallback)
    }
    
    seatLayout.value = seatData
    
    // Nếu ghế đã chọn bị đặt, bỏ chọn
    if (selectedSeat.value) {
      const currentSeat = seatData.floors
        ?.flatMap(f => f.seats)
        .find(s => s.seatId === selectedSeat.value.seatId)
      
      if (!currentSeat || currentSeat.status !== 'AVAILABLE') {
        selectedSeat.value = null
        if (!silent) {
          alert('⚠️ Ghế vừa chọn đã được đặt, vui lòng chọn ghế khác!')
        }
      }
    }

  } catch (err) {
    console.error('Error loading:', err)
    error.value = err.response?.data?.message || 'Lỗi tải thông tin'
  } finally {
    if (!silent) loading.value = false
  }
}

const getSeatClass = (seat) => {
  if (seat.status === 'BOOKED') return 'seat book'
  if (selectedSeat.value?.seatId === seat.seatId) return 'seat sel'
  return 'seat avail'
}

const getSeatTooltip = (seat) => {
  const st = {
    'AVAILABLE': 'Còn trống',
    'BOOKED': 'Đã đặt',
  }
  return `Ghế ${seat.seatNumber} - ${st[seat.status] || seat.status}`
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

  if (!authStore.user || !authStore.user.userId) {
    alert('⚠️ Vui lòng đăng nhập để đặt vé!')
    router.push('/login')
    return
  }

  if (!confirm(`Xác nhận đặt ghế ${selectedSeat.value.seatNumber} với phương thức ${getPaymentMethodName()}?`)) {
    return
  }

  bookingLoading.value = true
  error.value = ''

  try {
    // Kiểm tra lại ghế trước khi đặt
    await loadTripData(true)
    
    const currentSeat = seatLayout.value.floors
      .flatMap(floor => floor.seats)
      .find(s => s.seatId === selectedSeat.value.seatId)
    
    if (!currentSeat || currentSeat.status !== 'AVAILABLE') {
      throw new Error(`Ghế ${selectedSeat.value.seatNumber} đã được đặt! Vui lòng chọn ghế khác.`)
    }

    // Đặt vé
    const bookingRes = await api.post('/tickets/book', null, {
      params: {
        userId: authStore.user.userId,
        tripId: tripId,
        seatId: selectedSeat.value.seatId
      }
    })

    const ticketData = bookingRes.data.data
    console.log('✅ Vé đã tạo:', ticketData)

    // Xử lý thanh toán
    if (paymentMethod.value === 'CASH') {
      alert('✅ Đặt vé thành công!\n\nVui lòng thanh toán khi lên xe.')
      router.push('/my-tickets')
      
    } else if (paymentMethod.value === 'VNPAY') {
      const vnpayRes = await api.post('/vnpay/create', {
        amount: trip.value.price,
        orderInfo: `Thanh toan ve #${ticketData.ticketId} - ${trip.value.routeInfo}`
      })
      
      if (vnpayRes.data.code === '00' && vnpayRes.data.data) {
        window.location.href = vnpayRes.data.data
      } else {
        throw new Error(vnpayRes.data.message || 'Không thể tạo link thanh toán VNPay')
      }
      
    } else if (paymentMethod.value === 'MOMO') {
      const momoRes = await api.post('/momo/create', {
        amount: trip.value.price,
        orderInfo: `Thanh toan ve #${ticketData.ticketId} - ${trip.value.routeInfo}`
      })
      
      if (momoRes.data.code === '00' && momoRes.data.data) {
        window.location.href = momoRes.data.data
      } else {
        throw new Error(momoRes.data.message || 'Không thể tạo link thanh toán MoMo')
      }
    }

  } catch (err) {
    console.error('Booking error:', err)
    
    const errorMsg = err.response?.data?.message || err.message || 'Đặt vé thất bại!'
    alert('❌ ' + errorMsg)
    error.value = errorMsg
    
    // Refresh lại để cập nhật trạng thái ghế
    await loadTripData()
    selectedSeat.value = null
    
  } finally {
    bookingLoading.value = false
  }
}

const getPaymentMethodName = () => {
  const names = {
    'CASH': 'Tiền mặt',
    'VNPAY': 'VNPay',
    'MOMO': 'MoMo'
  }
  return names[paymentMethod.value] || paymentMethod.value
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('vi-VN')
}
</script>

<style scoped>
.booking-page {
  padding: 30px 20px;
  background: var(--gray-50);
  min-height: calc(100vh - 200px);
}

.breadcrumb {
  margin-bottom: 16px;
}

.back-link {
  color: var(--primary-color);
  font-weight: 600;
  transition: all 0.3s;
}

.back-link:hover {
  transform: translateX(-4px);
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 20px;
}

.booking-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trip-card {
  background: white;
  border-radius: 10px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.trip-header {
  background: var(--gray-50);
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-200);
}

.trip-header h3 {
  font-size: 17px;
  font-weight: 700;
}

.badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-info {
  background: #e0f2fe;
  color: #0369a1;
}

.trip-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trip-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.trip-row strong {
  font-weight: 600;
}

.trip-row .price {
  color: var(--primary-color);
  font-size: 17px;
}

.seats-card {
  background: white;
  border-radius: 10px;
  padding: 18px;
  box-shadow: var(--shadow);
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint {
  font-size: 12px;
  font-weight: 400;
  color: var(--gray-500);
}

.floors {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.floor {
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  padding: 12px;
  background: var(--gray-50);
}

.floor-name {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 10px;
  padding: 5px 10px;
  background: white;
  border-radius: 5px;
  display: inline-block;
}

.seats {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.seat {
  aspect-ratio: 1;
  border: none;
  border-radius: 5px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.seat.avail {
  background: #3b82f6;
  color: white;
}

.seat.avail:hover {
  background: #2563eb;
  transform: scale(1.05);
}

.seat.sel {
  background: #22c55e;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.seat.book {
  background: #9ca3af;
  color: #374151;
  cursor: not-allowed;
  opacity: 0.6;
}

.legend {
  display: flex;
  gap: 14px;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid var(--gray-300);
  margin-top: 12px;
}

.leg-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.dot.avail {
  background: #3b82f6;
}

.dot.sel {
  background: #22c55e;
}

.dot.book {
  background: #9ca3af;
}

.right-col {
  position: relative;
}

.summary {
  background: white;
  border-radius: 10px;
  padding: 18px;
  box-shadow: var(--shadow-lg);
  border: 2px solid var(--primary-color);
}

.summary.sticky {
  position: sticky;
  top: 80px;
}

.summary.empty {
  text-align: center;
  padding: 40px 18px;
  border: 2px dashed var(--gray-300);
  border-color: var(--gray-300);
}

.em-icon {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.sum-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
}

.seat-info {
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
  border: 2px solid #22c55e;
  border-radius: 8px;
  padding: 14px;
  text-align: center;
  margin-bottom: 14px;
}

.seat-num {
  font-size: 19px;
  font-weight: 800;
  color: #16a34a;
  margin-bottom: 4px;
}

.seat-deck {
  font-size: 13px;
  color: #166534;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--gray-300);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.price-box {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 12px;
  margin: 14px 0;
}

.p-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.p-total {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 2px solid var(--gray-300);
  margin-top: 6px;
  font-size: 17px;
  font-weight: 800;
  color: var(--primary-color);
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn-outline:hover {
  background: var(--gray-50);
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 8px;
}

.note {
  margin-top: 12px;
  font-size: 12px;
  color: var(--gray-600);
  text-align: center;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--gray-200);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.alert {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-error {
  background: #fee;
  color: #c00;
  border: 1px solid #fcc;
}

.alert-warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

@media (max-width: 768px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }

  .summary.sticky {
    position: static;
  }

  .seats {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>