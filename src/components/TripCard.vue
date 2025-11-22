<template>
  <div class="trip-card">
    <div class="trip-header">
      <div class="trip-route">
        <h3>{{ trip.routeName || `${from} → ${to}` }}</h3>
        <div class="trip-badge">
          <span class="badge badge-success">{{ availableSeats }} ghế trống</span>
        </div>
      </div>
    </div>

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
        <span class="detail-icon">💺</span>
        <div>
          <p class="detail-label">Số ghế</p>
          <p class="detail-value">{{ trip.capacity || '34' }} chỗ</p>
        </div>
      </div>
    </div>

    <div class="trip-footer">
      <div class="trip-price">
        <span class="price-label">Giá vé</span>
        <span class="price-value">{{ formatPrice(trip.price) }} VNĐ</span>
      </div>
      <button @click="$emit('select', trip)" class="btn btn-primary">
        Đặt vé ngay
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  from: String,
  to: String
})

defineEmits(['select'])

const availableSeats = computed(() => {
  return props.trip.availableSeats || Math.floor(Math.random() * 20) + 10
})

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
  return Number(price).toLocaleString('vi-VN')
}
</script>

<style scoped>
.trip-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.trip-card:hover {
  box-shadow: 0 8px 24px rgba(243, 107, 33, 0.15);
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.trip-header {
  margin-bottom: 20px;
}

.trip-route {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.trip-route h3 {
  font-size: 20px;
  color: var(--gray-900);
  font-weight: 700;
}

.trip-details {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--gray-50);
  border-radius: 8px;
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
  background: white;
  border-radius: 8px;
}

.detail-label {
  font-size: 13px;
  color: var(--gray-600);
  margin-bottom: 2px;
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--gray-900);
}

.trip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--gray-200);
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
  font-size: 24px;
  font-weight: 800;
  color: var(--primary-color);
}

@media (max-width: 640px) {
  .trip-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .trip-footer .btn {
    width: 100%;
  }
}
</style>