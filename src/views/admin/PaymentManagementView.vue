<template>
  <div class="payment-management-view admin-content-area">
    <div class="header-actions">
      <h2>Danh sách Giao dịch Thanh toán</h2>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID TT</th>
            <th>ID Vé</th>
            <th>Khách hàng</th>
            <th>Số tiền</th>
            <th>Phương thức</th>
            <th>Thời gian TT</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.payment_id">
            <td>{{ payment.payment_id }}</td>
            <td>{{ payment.ticket_id }}</td>
            <td>{{ payment.user_name || 'N/A' }}</td> <td>{{ formatPrice(payment.amount) }}</td>
            <td><span :class="['method-badge', payment.method ? payment.method.toLowerCase() : '']">{{ payment.method }}</span></td>
            <td>{{ formatDateTime(payment.payment_time) }}</td>
            <td><span :class="['status-badge', payment.status ? payment.status.toLowerCase() : '']">{{ payment.status }}</span></td>
          </tr>
          <tr v-if="payments.length === 0">
              <td colspan="7" class="no-data">
                  {{ isLoading ? 'Đang tải dữ liệu...' : 'Không có giao dịch nào được tìm thấy.' }}
              </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { paymentService } from '@/services/paymentService' // Import service

const payments = ref([])
const isLoading = ref(false)

// --- Hàm tiện ích ---
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('vi-VN', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        })
    } catch {
        return 'Invalid Date';
    }
}

const formatPrice = (price) => {
    if (price === null || price === undefined) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price).replace('₫', '') + ' VNĐ'
}

// --- Logic Tải Dữ liệu (CRUD - Read) ---
const fetchPayments = async () => {
    isLoading.value = true;
    try {
        // Gọi API để lấy danh sách thanh toán
        const rawData = await paymentService.getAllPayments(); 
        
        // Dữ liệu thanh toán thường cần join (kết hợp) với bảng users/tickets
        // Tùy thuộc vào Backend trả về (camelCase/snake_case)
        payments.value = rawData.map(p => ({
            // Ánh xạ các trường
            payment_id: p.paymentId || p.payment_id,
            ticket_id: p.ticketId || p.ticket_id,
            amount: p.amount,
            method: p.method,
            status: p.status,
            payment_time: p.paymentTime || p.payment_time,
            // Nếu Backend không join tên khách hàng, trường user_name sẽ là 'N/A'
            user_name: p.userFullName || p.user_name || 'N/A' 
        }));
        
    } catch (error) {
        console.error("Lỗi khi tải danh sách thanh toán:", error);
        alert('Lỗi: Không thể tải dữ liệu giao dịch thanh toán.');
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    fetchPayments()
})
</script>

<style scoped>
/* Giữ nguyên các style đã có */
.admin-content-area { padding: 32px; }
.header-actions { margin-bottom: 24px; }
.table-container { 
    background: white; padding: 24px; border-radius: 12px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow-x: auto;
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
.data-table th { background-color: #f4f4f4; }

/* Status Badges */
.status-badge {
    padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 13px; white-space: nowrap;
}
.status-badge.paid { background-color: #d1fae5; color: #059669; }
.status-badge.pending { background-color: #fef3c7; color: #fbbf24; }
.status-badge.cancelled { background-color: #fee2e2; color: #dc2626; }

/* Method Badges */
.method-badge {
    padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 13px; white-space: nowrap;
    background-color: #e0f2fe;
    color: #0c4a6e;
}
.method-badge.vnpay {
    background-color: #eef2ff;
    color: #4338ca;
}
</style>