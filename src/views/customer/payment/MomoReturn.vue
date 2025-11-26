<template>
  <div class="payment-result momo-theme">
    <div class="container">
      <div class="result-card">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Đang xác nhận thanh toán MoMo...</p>
        </div>

        <div v-else-if="paymentSuccess" class="success">
          <div class="icon">🎀</div>
          <h1>Thanh toán MoMo thành công!</h1>
          <p class="desc">Giao dịch của bạn đã được xác nhận</p>
          
          <div class="info-box">
            <div class="info-row">
              <span>Mã đơn hàng:</span>
              <strong>{{ orderId }}</strong>
            </div>
            <div class="info-row">
              <span>Mã giao dịch:</span>
              <strong>{{ transId }}</strong>
            </div>
            <div class="info-row">
              <span>Số tiền:</span>
              <strong class="amount">{{ formatPrice(amount) }} đ</strong>
            </div>
            <div class="info-row">
              <span>Thời gian:</span>
              <strong>{{ responseTime }}</strong>
            </div>
          </div>

          <div class="actions">
            <router-link to="/my-tickets" class="btn btn-primary">
              📋 Xem vé của tôi
            </router-link>
            <router-link to="/" class="btn btn-outline">
              🏠 Về trang chủ
            </router-link>
          </div>
        </div>

        <div v-else class="failure">
          <div class="icon">❌</div>
          <h1>Thanh toán thất bại</h1>
          <p class="desc">{{ errorMessage || 'Giao dịch không thành công' }}</p>
          
          <div class="actions">
            <button @click="$router.go(-1)" class="btn btn-primary">
              🔄 Thử lại
            </button>
            <router-link to="/" class="btn btn-outline">
              🏠 Về trang chủ
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(true)
const paymentSuccess = ref(false)
const orderId = ref('')
const transId = ref('')
const amount = ref(0)
const responseTime = ref('')
const errorMessage = ref('')

onMounted(() => {
  processPaymentResult()
})

const processPaymentResult = () => {
  const params = route.query
  
  console.log('MoMo return params:', params)
  
  // MoMo trả về resultCode = '0' nếu thành công
  if (params.resultCode === '0') {
    paymentSuccess.value = true
    orderId.value = params.orderId || 'N/A'
    transId.value = params.transId || 'N/A'
    amount.value = parseInt(params.amount || 0)
    responseTime.value = formatResponseTime(params.responseTime)
  } else {
    paymentSuccess.value = false
    errorMessage.value = params.message || 'Giao dịch thất bại'
  }
  
  loading.value = false
}

const formatResponseTime = (time) => {
  if (!time) return 'N/A'
  // Format: 20250101235959 -> 01/01/2025 23:59:59
  const year = time.substring(0, 4)
  const month = time.substring(4, 6)
  const day = time.substring(6, 8)
  const hour = time.substring(8, 10)
  const minute = time.substring(10, 12)
  const second = time.substring(12, 14)
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`
}

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('vi-VN')
}
</script>

<style scoped>
.payment-result {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.momo-theme {
  background: linear-gradient(135deg, #a0153e 0%, #d61f69 100%);
}

.result-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.loading {
  padding: 40px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e5e7eb;
  border-top-color: #a0153e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon {
  font-size: 80px;
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
}

.success h1 {
  color: #a0153e;
}

.failure h1 {
  color: #ef4444;
}

.desc {
  color: #6b7280;
  margin-bottom: 30px;
  font-size: 16px;
}

.info-box {
  background: #f9fafb;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span {
  color: #6b7280;
}

.info-row strong {
  color: #111827;
  font-weight: 600;
}

.info-row .amount {
  color: #a0153e;
  font-size: 18px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.btn {
  padding: 14px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background: #a0153e;
  color: white;
}

.btn-primary:hover {
  background: #8a1235;
  transform: translateY(-2px);
}

.btn-outline {
  background: white;
  color: #a0153e;
  border: 2px solid #a0153e;
}

.btn-outline:hover {
  background: #fef2f2;
}

@media (max-width: 640px) {
  .result-card {
    padding: 30px 20px;
  }

  h1 {
    font-size: 24px;
  }

  .icon {
    font-size: 60px;
  }
}
</style>