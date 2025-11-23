<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="track-page">
      <div class="container">
        <h1 class="page-title">🔍 Tra Cứu Vé</h1>
        <p class="page-subtitle">Nhập mã vé  để tra cứu thông tin</p>

        <!-- Search Form -->
        <div class="search-card">
          <form @submit.prevent="searchTicket" class="search-form">
            <div class="form-row">
              <div class="form-group">
                <label>Mã vé </label>
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
                  <span class="value code">{{ ticket.qrCode || `TICKET_${ticket.ticketId}` }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Họ tên:</span>
                  <span class="value">{{ ticket.fullName }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ ticket.email }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Tuyến đường:</span>
                  <span class="value">{{ ticket.routeInfo }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Biển số xe:</span>
                  <span class="value">{{ ticket.licensePlate }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Số ghế:</span>
                  <span class="value highlight">
                    {{ ticket.seatNumber }} ({{ ticket.deck === 'A' ? 'Tầng dưới' : 'Tầng trên' }})
                  </span>
                </div>

                <div class="info-item">
                  <span class="label">Ngày đặt:</span>
                  <span class="value">{{ formatDate(ticket.bookedAt) }}</span>
                </div>

                <div class="info-item">
                  <span class="label">Trạng thái:</span>
                  <span :class="['value', getStatusClass(ticket.status)]">
                    {{ getStatusText(ticket.status) }}
                  </span>
                </div>
              </div>

              <!-- QR Code -->
              <div v-if="ticket.status === 'PAID'" class="qr-section">
                <h3>Mã QR Code</h3>
                <img 
                  :src="getQRCodeUrl(ticket.qrCode || `TICKET_${ticket.ticketId}`)"
                  alt="QR Code"
                  class="qr-image"
                />
                <p class="qr-note">Xuất trình mã này khi lên xe</p>
              </div>
            </div>

            <div class="result-actions">
              <button @click="resetSearch" class="btn btn-outline">
                Tra cứu vé khác
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import api from '@/services/api'

const searchQuery = ref('')
const searching = ref(false)
const searched = ref(false)
const ticket = ref(null)
const error = ref('')

const searchTicket = async () => {
  if (!searchQuery.value.trim()) {
    error.value = 'Vui lòng nhập mã vé '
    return
  }

  searching.value = true
  searched.value = true
  error.value = ''
  ticket.value = null

  try {
    // Try to find ticket by QR code or email
    // Option 1: Search by ticket ID if it's a number
    if (/^\d+$/.test(searchQuery.value)) {
      const res = await api.get(`/tickets/${searchQuery.value}`)
      ticket.value = res.data.data
    } 

    // Option 3: Treat as QR code
    else {
      error.value = 'Không tìm thấy vé. Vui lòng kiểm tra lại mã vé.'
    }
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.response?.data?.message || 'Không tìm thấy vé. Vui lòng kiểm tra lại thông tin.'
  } finally {
    searching.value = false
  }
}

const resetSearch = () => {
  searchQuery.value = ''
  searched.value = false
  ticket.value = null
  error.value = ''
}

const getQRCodeUrl = (code) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${code}`
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const map = {
    'PENDING': 'warning',
    'PAID': 'success',
    'CANCELLED': 'danger',
    'COMPLETED': 'info'
  }
  return map[status] || 'default'
}

const getStatusText = (status) => {
  const map = {
    'PENDING': 'Chờ thanh toán',
    'PAID': 'Đã thanh toán',
    'CANCELLED': 'Đã hủy',
    'COMPLETED': 'Hoàn thành'
  }
  return map[status] || status
}
</script>

<style scoped>
.track-page {
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
  background: var(--gray-50);
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  text-align: center;
}

.page-subtitle {
  color: var(--gray-600);
  margin-bottom: 32px;
  text-align: center;
}

.search-card {
  max-width: 600px;
  margin: 0 auto 32px;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
}

.search-form {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
}

.form-group {
  flex: 1;
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

.info-item .value.success {
  color: var(--success-color);
}

.info-item .value.warning {
  color: var(--warning-color);
}

.info-item .value.danger {
  color: var(--danger-color);
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

.result-actions {
  padding: 20px 24px;
  border-top: 1px solid var(--gray-200);
  text-align: center;
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