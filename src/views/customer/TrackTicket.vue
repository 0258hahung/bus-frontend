<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="track-page">
      <div class="container">
        <h1 class="page-title">🔍 Tra Cứu Vé</h1>
        <p class="page-subtitle">Nhập mã vé để tra cứu thông tin</p>

        <!-- Search Form -->
        <div class="search-card">
          <form @submit.prevent="searchTicket" class="search-form">
            <div class="form-row">
              <div class="form-group">
                <label>Mã vé</label>
                <input 
                  v-model="searchQuery"
                  type="text"
                  class="form-input"
                  placeholder="Nhập mã vé"
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary" :disabled="searching">
                {{ searching ? 'Đang tìm...' : '🔍 Tra cứu' }}
              </button>
            </div>
          </form>

          <p class="hint">
            💡 Mã vé được gửi qua email khi bạn đặt vé thành công
          </p>
        </div>

        <!-- Search Result -->
        <div v-if="searched && !searching">
          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div v-else-if="ticket" class="ticket-result">
            <div class="result-header">
              <h2>Thông tin vé</h2>
              <span :class="['status-badge', getStatusClass(ticket.status)]">
                {{ getStatusText(ticket.status) }}
              </span>
            </div>

            <div class="result-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Mã vé:</span>
                  <span class="value code">{{ `TICKET_${ticket.ticketId}` }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Họ tên:</span>
                  <span class="value">{{ ticket.fullName || 'Chưa có tên' }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ ticket.email }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Tuyến đường:</span>
                  <span class="value">{{ ticket.routeInfo || 'N/A' }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Biển số xe:</span>
                  <span class="value">{{ ticket.licensePlate || 'N/A' }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Giờ khởi hành:</span>
                  <span class="value highlight">
                    {{ ticket.departureTime 
                      ? formatDateTime(ticket.departureTime) 
                      : 'Chưa xác định' }}
                  </span>
                </div>

                <div class="info-item">
                  <span class="label">Ghế:</span>
                  <span class="value highlight">
                    {{ ticket.seatNumber }} (Tầng {{ ticket.deck }})
                  </span>
                </div>

                <div class="info-item">
                  <span class="label">SĐT:</span>
                  <span class="value">{{ ticket.phone || 'N/A' }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Giá vé:</span>
                  <span class="value highlight">
                    {{ ticket.price ? formatCurrency(ticket.price) + ' đ' : '350.000 đ' }}
                  </span>
                </div>

                <div class="info-item">
                  <span class="label">Ngày đặt:</span>
                  <span class="value">{{ formatDate(ticket.bookedAt) }}</span>
                </div>
              </div>

              <!-- QR Section -->
              <div class="qr-section" v-if="ticket.qrCode">
                <h3>QR Code Check-in</h3>
                <img :src="`data:image/png;base64,${ticket.qrCode}`" alt="QR Code" class="qr-image" />
                <p class="qr-note">Quét mã này để check-in tại bến xe</p>
              </div>
            </div>
          </div>

          <div v-else class="no-result">
            Không tìm thấy vé với mã này
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/AuthStore'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const searchQuery = ref('')
const searching = ref(false)
const searched = ref(false)
const ticket = ref(null)
const error = ref(null)

const authStore = useAuthStore()

const searchTicket = async () => {
  searching.value = true
  searched.value = true
  error.value = null
  ticket.value = null

  try {
    const query = searchQuery.value.trim()

    if (!query) {
      throw new Error('Vui lòng nhập mã vé')
    }

    if (!/^\d+$/.test(query)) {
      throw new Error('Mã vé không hợp lệ. Vui lòng nhập số.')
    }

    // Lấy thông tin vé từ API công khai
    const res = await api.get(`/tickets/track/${query}`)
    const ticketData = res.data.data

    if (!ticketData) {
      error.value = 'Không tìm thấy vé với mã này'
      return
    }

    // Lấy departureTime từ API /trips/{tripId}
    let departureTime = null
    if (ticketData.tripId) {
      try {
        const tripRes = await api.get(`/trips/${ticketData.tripId}`)
        const tripData = tripRes.data.data || tripRes.data
        departureTime = tripData.departureTime
        console.log(`Trip #${ticketData.tripId} departure:`, departureTime)
      } catch (e) {
        console.warn(`Không load trip #${ticketData.tripId}:`, e)
      }
    }

    // Merge dữ liệu
    ticket.value = {
      ...ticketData,
      departureTime: departureTime || ticketData.departureTime
    }

    console.log('Ticket loaded:', ticket.value)
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tra cứu vé'
  } finally {
    searching.value = false
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'PAID': return 'success'
    case 'PENDING': return 'warning'
    case 'CANCELLED': return 'danger'
    default: return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'PAID': return 'Đã thanh toán'
    case 'PENDING': return 'Chờ thanh toán'
    case 'CANCELLED': return 'Đã hủy'
    default: return status
  }
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount)
}
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.track-page {
  flex: 1;
  padding: 40px 0;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 8px;
  text-align: center;
}

.page-subtitle {
  font-size: 16px;
  color: var(--gray-600);
  text-align: center;
  margin-bottom: 32px;
}

.search-card {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  padding: 32px;
  max-width: 600px;
  margin: 0 auto 40px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.hint {
  text-align: center;
  font-size: 13px;
  color: var(--gray-600);
  padding: 12px;
  background: var(--gray-50);
  border-radius: 6px;
}

.alert {
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Ticket Result */
.ticket-result {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.result-header {
  background: var(--gray-50);
  padding: 20px 24px;
  border-bottom: 2px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h2 {
  font-size: 22px;
  font-weight: 700;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.result-body {
  padding: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 13px;
  color: var(--gray-600);
}

.info-item .value {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-900);
}

.info-item .value.code {
  font-family: 'Courier New', monospace;
  background: var(--gray-100);
  padding: 6px 10px;
  border-radius: 4px;
}

.info-item .value.highlight {
  color: var(--primary-color);
  font-size: 17px;
}

/* QR Section */
.qr-section {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #22c55e;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
}

.qr-section h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #166534;
}

.qr-image {
  width: 250px;
  height: 250px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin: 0 auto 12px;
}

.qr-note {
  font-size: 14px;
  color: #166534;
  font-weight: 600;
}

.no-result {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  color: var(--gray-600);
  font-size: 16px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>