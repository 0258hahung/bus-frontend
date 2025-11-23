<!-- src/views/admin/Dashboard.vue -->
<template>
  <div class="admin-content">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Tổng chuyến xe</h3>
          <div class="number">{{ totalTrips }}</div>
          <p class="stat-description">Chuyến xe hoạt động</p>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
          <h3>Tổng người dùng</h3>
          <div class="number">{{ totalUsers }}</div>
          <p class="stat-description">Tài khoản đã đăng ký</p>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);">
          <h3>Tổng xe buýt</h3>
          <div class="number">{{ totalBuses }}</div>
          <p class="stat-description">Xe đang hoạt động</p>
        </div>
        
        <div class="stat-card" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
          <h3>Doanh thu</h3>
          <div class="number">{{ formatPrice(totalRevenue) }}</div>
          <p class="stat-description">Tổng doanh thu</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2>⚡ Quản lý nhanh</h2>
        
        <div class="quick-actions-grid">
          <router-link 
            to="/admin/routes" 
            class="quick-action-btn"
            style="background: linear-gradient(135deg, #ea580c, #c2410c);"
          >
            <div class="action-icon">🛣️</div>
            <div class="action-title">Quản lý tuyến xe</div>
            <div class="action-desc">Thêm, sửa, xóa tuyến xe</div>
          </router-link>
          
          <router-link 
            to="/admin/buses" 
            class="quick-action-btn"
            style="background: linear-gradient(135deg, #3b82f6, #2563eb);"
          >
            <div class="action-icon">🚌</div>
            <div class="action-title">Quản lý xe buýt</div>
            <div class="action-desc">Quản lý danh sách xe</div>
          </router-link>
          
          <router-link 
            to="/admin/trips" 
            class="quick-action-btn"
            style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);"
          >
            <div class="action-icon">🕐</div>
            <div class="action-title">Quản lý chuyến</div>
            <div class="action-desc">Lên lịch chuyến xe</div>
          </router-link>
          
          <router-link 
            to="/admin/users" 
            class="quick-action-btn"
            style="background: linear-gradient(135deg, #64748b, #475569);"
          >
            <div class="action-icon">👥</div>
            <div class="action-title">Người dùng</div>
            <div class="action-desc">Quản lý tài khoản</div>
          </router-link>
          
          <router-link 
            to="/admin/tickets" 
            class="quick-action-btn"
            style="background: linear-gradient(135deg, #ef4444, #dc2626);"
          >
            <div class="action-icon">🎫</div>
            <div class="action-title">Vé đã đặt</div>
            <div class="action-desc">Xem đặt vé</div>
          </router-link>
          
          <router-link 
            to="/admin/payments" 
            class="quick-action-btn"
            style="background: linear-gradient(135deg, #10b981, #059669);"
          >
            <div class="action-icon">💰</div>
            <div class="action-title">Thanh toán</div>
            <div class="action-desc">Lịch sử giao dịch</div>
          </router-link>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <h2>📊 Hoạt động gần đây</h2>
        
        <div class="activity-grid">
          <div class="activity-item">
            <div class="activity-icon" style="background: #dbeafe; color: #2563eb;">🎫</div>
            <div class="activity-content">
              <h4>Vé mới đặt hôm nay</h4>
              <p class="activity-number">{{ recentTickets }}</p>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon" style="background: #dcfce7; color: #059669;">💵</div>
            <div class="activity-content">
              <h4>Doanh thu hôm nay</h4>
              <p class="activity-number">{{ formatPrice(todayRevenue) }}</p>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon" style="background: #fef3c7; color: #d97706;">🚌</div>
            <div class="activity-content">
              <h4>Chuyến xe hôm nay</h4>
              <p class="activity-number">{{ todayTrips }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const totalTrips = ref(0)
const totalUsers = ref(0)
const totalBuses = ref(0)
const totalRevenue = ref(0)
const recentTickets = ref(0)
const todayRevenue = ref(0)
const todayTrips = ref(0)

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(value)
}

const getTodayStats = (data) => {
  const today = new Date().toDateString()
  return data.filter(item => {
    const itemDate = new Date(item.createdAt || item.departureTime).toDateString()
    return itemDate === today
  })
}

onMounted(async () => {
  try {
    loading.value = true
    
    const [tripsRes, usersRes, busesRes, paymentsRes, ticketsRes] = await Promise.all([
      api.get('/trips'),
      api.get('/users'),
      api.get('/buses'),
      api.get('/payments/admin/all'),
      api.get('/tickets/admin/all')
    ])

    // Tổng thống kê
    totalTrips.value = tripsRes.data.data?.length || 0
    totalUsers.value = usersRes.data.data?.length || 0
    totalBuses.value = busesRes.data.data?.length || 0
    totalRevenue.value = paymentsRes.data.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    // Thống kê hôm nay
    const tickets = ticketsRes.data.data || []
    const payments = paymentsRes.data.data || []
    const trips = tripsRes.data.data || []
    
    recentTickets.value = getTodayStats(tickets).length
    todayRevenue.value = getTodayStats(payments).reduce((sum, p) => sum + (p.amount || 0), 0)
    todayTrips.value = getTodayStats(trips).length

  } catch (err) {
    console.error('Lỗi tải dashboard:', err)
    alert('Không thể tải dữ liệu dashboard. Vui lòng thử lại!')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #ea580c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stat-description {
  margin: 8px 0 0 0;
  font-size: 13px;
  opacity: 0.85;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.quick-action-btn {
  display: block;
  padding: 28px 24px;
  border-radius: 12px;
  text-align: center;
  color: white;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.action-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.action-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
}

.action-desc {
  font-size: 14px;
  opacity: 0.9;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.activity-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border-radius: 12px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.activity-number {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #111827;
}

@media (max-width: 768px) {
  .quick-actions-grid,
  .activity-grid {
    grid-template-columns: 1fr;
  }
}
</style>