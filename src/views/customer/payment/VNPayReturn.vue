<template>
  <div class="payment-result vnpay-theme">
    <div class="container">
      <div class="result-card">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Đang xác nhận thanh toán VNPay...</p>
        </div>

        <div v-else-if="paymentSuccess" class="success">
          <div class="icon">✅</div>
          <h1>Thanh toán VNPay thành công!</h1>
          <p class="desc">Giao dịch của bạn đã được xác nhận</p>
          
          <div class="info-box">
            <div class="info-row">
              <span>Mã giao dịch:</span>
              <strong>{{ transactionId }}</strong>
            </div>
            <div class="info-row">
              <span>Mã ngân hàng:</span>
              <strong>{{ bankCode }}</strong>
            </div>
            <div class="info-row">
              <span>Số tiền:</span>
              <strong class="amount">{{ formatPrice(amount) }} đ</strong>
            </div>
            <div class="info-row">
              <span>Thời gian:</span>
              <strong>{{ payTime }}</strong>
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
          <p class="desc">{{ errorMessage || 'Có lỗi xảy ra trong quá trình thanh toán' }}</p>
          
          <div v-if="responseCode" class="error-code">
            Mã lỗi: <strong>{{ responseCode }}</strong>
          </div>
          
          <div class="actions">
            <button @click="$router.go(-2)" class="btn btn-primary">
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
const transactionId = ref('')
const bankCode = ref('')
const amount = ref(0)
const payTime = ref('')
const responseCode = ref('')
const errorMessage = ref('')

onMounted(() => {
  processPaymentResult()
})

const processPaymentResult = () => {
  const params = route.query
  
  console.log('VNPay return params:', params)
  
  responseCode.value = params.vnp_ResponseCode || ''
  
  // VNPay trả về vnp_ResponseCode = '00' nếu thành công
  if (params.vnp_ResponseCode === '00') {
    paymentSuccess.value = true
    transactionId.value = params.vnp_TxnRef || 'N/A'
    bankCode.value = params.vnp_BankCode || 'N/A'
    amount.value = parseInt(params.vnp_Amount || 0) / 100
    payTime.value = formatPayTime(params.vnp_PayDate)
  } else {
    paymentSuccess.value = false
    errorMessage.value = getErrorMessage(params.vnp_ResponseCode)
  }
  
  loading.value = false
}

const formatPayTime = (time) => {
  if (!time) return new Date().toLocaleString('vi-VN')
  // Format: 20250101235959 -> 01/01/2025 23:59:59
  try {
    const year = time.substring(0, 4)
    const month = time.substring(4, 6)
    const day = time.substring(6, 8)
    const hour = time.substring(8, 10)
    const minute = time.substring(10, 12)
    const second = time.substring(12, 14)
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  } catch {
    return new Date().toLocaleString('vi-VN')
  }
}

const getErrorMessage = (code) => {
  const messages = {
    '07': 'Giao dịch bị từ chối bởi ngân hàng',
    '09': 'Thẻ chưa đăng ký dịch vụ Internet Banking',
    '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
    '11': 'Đã hết hạn chờ thanh toán',
    '12': 'Thẻ bị khóa',
    '13': 'Nhập sai mật khẩu quá số lần quy định',
    '24': 'Giao dịch bị hủy',
    '51': 'Tài khoản không đủ số dư',
    '65': 'Vượt quá hạn mức giao dịch',
    '75': 'Ngân hàng thanh toán đang bảo trì',
    '79': 'Giao dịch vượt quá số lần thanh toán trong ngày',
    '99': 'Lỗi không xác định'
  }
  return messages[code] || `Lỗi không xác định (Mã: ${code})`
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

.vnpay-theme {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
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
  border-top-color: #3b82f6;
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
  color: #22c55e;
}

.failure h1 {
  color: #ef4444;
}

.desc {
  color: #6b7280;
  margin-bottom: 30px;
  font-size: 16px;
}

.error-code {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
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
  color: #22c55e;
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
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-outline {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-outline:hover {
  background: #eff6ff;
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