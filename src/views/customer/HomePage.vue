<template>
  <div class="page-wrapper">
    <Navbar />
    
    <main class="main-content">
      <!-- Hero Section with Search -->
      <section class="hero-section">
        <div class="container">
          <SearchForm @search="handleSearch" />
        </div>
      </section>

      <!-- Search Results -->
      <section v-if="searched" class="results-section">
        <div class="container">
          <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Đang tìm kiếm chuyến xe...</p>
          </div>

          <div v-else-if="trips.length > 0">
            <div class="results-header">
              <h2 class="section-title">
                Tìm thấy {{ trips.length }} chuyến xe
              </h2>
              <p class="results-subtitle">
                {{ searchInfo.from }} → {{ searchInfo.to }} - {{ formatDate(searchInfo.date) }}
              </p>
            </div>

            <div class="trips-grid">
              <div v-for="trip in trips" :key="trip.tripId" class="trip-card">
                <div class="trip-header">
                  <h3 class="trip-route">{{ trip.routeName || `${searchInfo.from} → ${searchInfo.to}` }}</h3>
                  <span class="badge badge-success">
                    {{ trip.availableSeats || 0 }} ghế trống
                  </span>
                </div>

                <div class="trip-body">
                  <div class="trip-details">
                    <div class="detail-item">
                      <span class="detail-icon">🕐</span>
                      <div>
                        <p class="detail-label">Giờ khởi hành</p>
                        <p class="detail-value">{{ formatTime(trip.departureTime) }}</p>
                      </div>
                    </div>

                    <div class="detail-item">
                      <span class="detail-icon">🚌</span>
                      <div>
                        <p class="detail-label">Loại xe</p>
                        <p class="detail-value">{{ trip.busType || 'Giường nằm' }}</p>
                      </div>
                    </div>

                    <div class="detail-item">
                      <span class="detail-icon">⏱️</span>
                      <div>
                        <p class="detail-label">Thời gian</p>
                        <p class="detail-value">{{ trip.duration || '6-8 giờ' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="trip-footer">
                  <div class="trip-price">
                    <span class="price-label">Giá vé</span>
                    <span class="price-value">{{ formatPrice(trip.price) }} VNĐ</span>
                  </div>
                  <router-link :to="`/booking/${trip.tripId}`" class="btn btn-primary">
                    Đặt vé ngay
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>Không tìm thấy chuyến xe phù hợp</h3>
            <p>Vui lòng thử tìm kiếm với điểm đến khác hoặc ngày khác</p>
            <button @click="resetSearch" class="btn btn-primary mt-3">
              Tìm kiếm lại
            </button>
          </div>

          <div v-if="error" class="alert alert-error mt-3">
            {{ error }}
          </div>
        </div>
      </section>

      <!-- Features Section (hiển thị khi chưa search) -->
      <section v-else class="features-section">
        <div class="container">
          <h2 class="section-title text-center mb-4">Tại sao chọn FUTA Bus?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🎫</div>
              <h3>Đặt vé dễ dàng</h3>
              <p>Chọn chuyến, chọn ghế, thanh toán nhanh chóng trong vài phút</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💳</div>
              <h3>Thanh toán an toàn</h3>
              <p>Hỗ trợ VNPay và thanh toán khi lên xe, bảo mật tuyệt đối</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🚌</div>
              <h3>Xe chất lượng</h3>
              <p>Đội xe hiện đại, ghế nằm êm ái, tài xế chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import SearchForm from '@/components/SearchForm.vue'
import api from '@/services/api'

const trips = ref([])
const loading = ref(false)
const error = ref('')
const searched = ref(false)
const searchInfo = ref({
  from: '',
  to: '',
  date: ''
})

const handleSearch = async (form) => {
  if (!form.from || !form.to || !form.date) {
    error.value = 'Vui lòng điền đầy đủ thông tin'
    return
  }

  loading.value = true
  error.value = ''
  searched.value = true
  searchInfo.value = { ...form }

  try {
    const res = await api.get('/trips/search', { params: form })
    trips.value = res.data.data || []
    
    if (trips.value.length === 0) {
      error.value = ''
    }
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.response?.data?.message || 'Tìm kiếm thất bại. Vui lòng thử lại!'
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searched.value = false
  trips.value = []
  error.value = ''
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

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
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
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 80px 20px;
}

.results-section,
.features-section {
  padding: 60px 20px;
}

.results-header {
  margin-bottom: 32px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.results-subtitle {
  color: var(--gray-600);
  font-size: 16px;
}

.trips-grid {
  display: grid;
  gap: 24px;
}

.trip-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.trip-card:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-4px);
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.trip-route {
  font-size: 22px;
  font-weight: 700;
  color: var(--gray-900);
}

.trip-body {
  padding: 24px;
}

.trip-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
  border-radius: 8px;
}

.detail-label {
  font-size: 13px;
  color: var(--gray-600);
  margin-bottom: 2px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
}

.trip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid var(--gray-200);
  gap: 16px;
}

.trip-price {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 13px;
  color: var(--gray-600);
}

.price-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--primary-color);
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 40px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.feature-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--gray-900);
}

.feature-card p {
  color: var(--gray-600);
  line-height: 1.6;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 80px 20px;
}

.no-results-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.no-results h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--gray-900);
}

.no-results p {
  color: var(--gray-600);
  font-size: 16px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px;
  }

  .section-title {
    font-size: 24px;
  }

  .trip-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .trip-footer .btn {
    width: 100%;
  }
}
</style>