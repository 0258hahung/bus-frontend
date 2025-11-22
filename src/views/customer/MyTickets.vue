<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="tickets-page">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">🎫 Vé Của Tôi</h1>
          <router-link to="/" class="btn btn-outline">
            ← Đặt vé mới
          </router-link>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Đang tải danh sách vé...</p>
        </div>

        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <div v-else-if="tickets.length > 0" class="tickets-container">
          <!-- Filter Tabs -->
          <div class="filter-tabs">
            <button 
              v-for="status in filterStatuses" 
              :key="status.value"
              :class="['filter-tab', { active: currentFilter === status.value }]"
              @click="currentFilter = status.value"
            >
              {{ status.label }}
              <span class="count">{{ getFilterCount(status.value) }}</span>
            </button>
          </div>

          <!-- Tickets List -->
          <div class="tickets-list">
            <div 
              v-for="ticket in filteredTickets" 
              :key="ticket.ticketId" 
              class="ticket-card"
            >
              <!-- Ticket Header -->
              <div class="ticket-header">
                <div class="ticket-status">
                  <span :class="['status-badge', getStatusClass(ticket.status)]">
                    {{ getStatusText(ticket.status) }}
                  </span>
                  <span class="ticket-code">{{ ticket.ticketCode }}</span>
                </div>
                <div class="ticket-date">
                  {{ formatDate(ticket.createdAt) }}
                </div>
              </div>

              <!-- Ticket Body -->
              <div class="ticket-body">
                <div class="route-info">
                  <h3 class="route-name">
                    {{ ticket.trip?.routeName || 'N/A' }}
                  </h3>
                  <div class="route-details">
                    <span class="from">{{ ticket.trip?.from || 'N/A' }}</span>
                    <span class="arrow">→</span>
                    <span class="to">{{ ticket.trip?.to || 'N/A' }}</span>
                  </div>
                </div>

                <div class="ticket-details">
                  <div class="detail-group">
                    <div class="detail-item">
                      <span class="detail-icon">🕐</span>
                      <div class="detail-content">
                        <span class="detail-label">Giờ khởi hành</span>
                        <span class="detail-value">{{ formatTime(ticket.trip?.departureTime) }}</span>
                      </div>
                    </div>

                    <div class="detail-item">
                      <span class="detail-icon">💺</span>
                      <div class="detail-content">
                        <span class="detail-label">Số ghế</span>
                        <span class="detail-value highlight">{{ ticket.seat?.seatNumber || 'N/A' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="detail-group">
                    <div class="detail-item">
                      <span class="detail-icon">🚌</span>
                      <div class="detail-content">
                        <span class="detail-label">Xe</span>
                        <span class="detail-value">{{ ticket.trip?.busType || 'Giường nằm' }}</span>
                      </div>
                    </div>

                    <div class="detail-item">
                      <span class="detail-icon">💰</span>
                      <div class="detail-content">
                        <span class="detail-label">Giá vé</span>
                        <span class="detail-value price">{{ formatPrice(ticket.price) }} VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- QR Code for PAID tickets -->
                <div v-if="ticket.status === 'PAID'" class="qr-section">
                  <div class="qr-header">
                    <p class="qr-label">Xuất trình mã QR khi lên xe</p>
                  </div>
                  <div class="qr-code">
                    <img 
                      :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketCode}`" 
                      :alt="`QR Code ${ticket.ticketCode}`"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              <!-- Ticket Actions -->
              <div class="ticket-actions">
                <button 
                  v-if="ticket.status === 'PENDING'" 
                  @click="cancelTicket(ticket.ticketId)" 
                  class="btn btn-danger btn-sm"
                  :disabled="cancelling === ticket.ticketId"
                >
                  {{ cancelling === ticket.ticketId ? 'Đang hủy...' : 'Hủy vé' }}
                </button>
                <button 
                  v-if="ticket.status === 'PAID'"
                  @click="downloadTicket(ticket)"
                  class="btn btn-outline btn-sm"
                >
                  📥 Tải vé
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Tickets -->
        <div v-else class="no-tickets">
          <div class="no-tickets-icon">🎫</div>
          <h3>Bạn chưa có vé nào</h3>
          <p>Hãy đặt vé ngay để trải nghiệm dịch vụ của chúng tôi</p>
          <router-link to="/" class="btn btn-primary mt-3">
            Đặt vé ngay
          </router-link>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import api from '@/services/api'

const authStore = useAuthStore()
const tickets = ref([])
const loading = ref(false)
const error = ref('')
const cancelling = ref(null)
const currentFilter = ref('all')

const filterStatuses = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'CANCELLED', label: 'Đã hủy' }
]

const filteredTickets = computed(() => {
  if (currentFilter.value === 'all') return tickets.value
  return tickets.value.filter(t => t.status === currentFilter.value)
})

const getFilterCount = (status) => {
  if (status === 'all') return tickets.value.length
  return tickets.value.filter(t => t.status === status).length
}

onMounted(async () => {
  await loadTickets()
})

const loadTickets = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await api.get(`/tickets/user/${authStore.user.userId}`)
    tickets.value = res.data.data || []
    
    // Sort by date (newest first)
    tickets.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    console.error('Error loading tickets:', err)
    error.value = 'Lỗi tải danh sách vé. Vui lòng thử lại!'
  } finally {
    loading.value = false
  }
}

const cancelTicket = async (ticketId) => {
  if (!confirm('Bạn có chắc muốn hủy vé này? Hành động này không thể hoàn tác.')) return

  cancelling.value = ticketId
  
  try {
    await api.post(`/tickets/${ticketId}/cancel?userId=${authStore.user.userId}`)
    alert('Hủy vé thành công!')
    await loadTickets()
  } catch (err) {
    console.error('Cancel error:', err)
    alert(err.response?.data?.message || 'Hủy vé thất bại. Vui lòng thử lại!')
  } finally {
    cancelling.value = null
  }
}

const downloadTicket = (ticket) => {
  alert('Tính năng tải vé đang được phát triển!')
  // TODO: Implement PDF download
}

const formatTime = (time) => {
  if (!time) return 'N/A'
  return new Date(time).toLocaleString('vi-VN', {
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

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('vi-VN')
}

const getStatusClass = (status) => {
  const classes = {
    'PENDING': 'warning',
    'PAID': 'success',
    'CANCELLED': 'danger',
    'COMPLETED': 'info'
  }
  return classes[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': 'Chờ thanh toán',
    'PAID': 'Đã thanh toán',
    'CANCELLED': 'Đã hủy',
    'COMPLETED': 'Hoàn thành'
  }
  return texts[status] || status
}
</script>

<style scoped>
.tickets-page {
  padding: 40px 20px;
  min-height: calc(100vh - 200px);
  background: var(--gray-50);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--gray-900);
}

.tickets-container {
  max-width: 900px;
  margin: 0 auto;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-tab {
  padding: 10px 20px;
  border: 2px solid var(--gray-300);
  background: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tab:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
  color: white;
}

.filter-tab.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.filter-tab .count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.filter-tab.active .count {
  background: rgba(255, 255, 255, 0.3);
}

/* Tickets List */
.tickets-list {
  display: grid;
  gap: 20px;
}

.ticket-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.ticket-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.ticket-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.ticket-code {
  font-size: 13px;
  color: var(--gray-600);
  font-family: monospace;
}

.ticket-date {
  font-size: 13px;
  color: var(--gray-500);
}

.ticket-body {
  padding: 24px;
}

.route-info {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--gray-100);
}

.route-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.route-details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: var(--gray-600);
}

.arrow {
  color: var(--primary-color);
  font-weight: 700;
}

.ticket-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
  border-radius: 8px;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 12px;
  color: var(--gray-600);
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-900);
}

.detail-value.highlight {
  color: var(--primary-color);
  font-size: 18px;
}

.detail-value.price {
  color: var(--primary-color);
  font-size: 17px;
}

/* QR Section */
.qr-section {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 24px;
}

.qr-header {
  margin-bottom: 12px;
}

.qr-label {
  font-size: 14px;
  color: var(--gray-700);
  font-weight: 600;
}

.qr-code img {
  width: 150px;
  height: 150px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

/* Ticket Actions */
.ticket-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--gray-200);
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

/* No Tickets */
.no-tickets {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.no-tickets-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.no-tickets h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--gray-900);
}

.no-tickets p {
  color: var(--gray-600);
  font-size: 16px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .ticket-details {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-wrap: nowrap;
  }
}
</style>