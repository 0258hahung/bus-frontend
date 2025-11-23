<template>
  <div class="ticket-management-view admin-content-area">
    <div class="header-actions">
      <h2>Danh sách Vé đã đặt</h2>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID Vé</th>
            <th>Tuyến xe</th>
            <th>Khởi hành</th>
            <th>Khách hàng</th>
            <th>Ghế</th>
            <th>Giá vé</th>
            <th>Thời gian đặt</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.ticket_id">
            <td>{{ ticket.ticket_id }}</td>
            <td>{{ ticket.route_name }}</td>
            <td>{{ formatDateTime(ticket.departure_time) }}</td>
            <td>{{ ticket.user_name }}</td>
            <td>{{ ticket.seat_info }}</td>
            <td>{{ formatPrice(ticket.price) }}</td>
            <td>{{ formatDateTime(ticket.booked_at) }}</td>
            <td><span :class="['status-badge', ticket.status ? ticket.status.toLowerCase() : '']">{{ ticket.status }}</span></td>
            <td>
              <button @click="viewPayment(ticket)" class="action-btn view-btn">Xem TT</button>
              <button 
                @click="changeStatus(ticket.ticket_id, 'CANCELLED')" 
                v-if="ticket.status !== 'CANCELLED' && ticket.status !== 'PAID'"
                class="action-btn cancel-btn"
              >Hủy</button>
            </td>
          </tr>
          <tr v-if="tickets.length === 0">
              <td colspan="9" class="no-data">
                 {{ isLoading ? 'Đang tải dữ liệu...' : 'Không có vé nào được tìm thấy.' }}
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ticketService } from '@/services/ticketService' // Import service

const tickets = ref([])
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
    if (price === null || price === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(price)
}

// --- Logic Tải Dữ liệu (CRUD - Read) ---
const fetchTickets = async () => {
    isLoading.value = true;
    try {
        // Lấy dữ liệu từ API. Giả định API đã join data từ trips, users, seats.
        const rawData = await ticketService.getAllTickets(); 
        
        // Ánh xạ dữ liệu từ camelCase (DB) sang snake_case (Vue Template)
        tickets.value = rawData.map(t => ({
            // Ánh xạ ID và giá trị cơ bản
            ticket_id: t.ticketId || t.ticket_id,
            price: t.price, // Giá vé
            status: t.status, // Trạng thái vé (PENDING, PAID, CANCELLED)
            booked_at: t.bookedAt || t.booked_at, // Thời gian đặt

            // Thông tin phức hợp (Giả định Backend đã join và đặt tên field)
            user_name: t.userName || t.userFullName || 'N/A', // Tên khách hàng
            route_name: t.routeName || `${t.departure} - ${t.destination}` || 'N/A', // Tuyến xe
            departure_time: t.departureTime || t.departure_time, // Giờ khởi hành chuyến đi
            seat_info: t.seatInfo || `${t.deck}${t.seatNumber}` || 'N/A' // Thông tin ghế
        }));
        
    } catch (error) {
        console.error("Lỗi khi tải danh sách vé:", error);
        alert('Lỗi: Không thể tải dữ liệu vé đã đặt.');
    } finally {
        isLoading.value = false;
    }
}

// --- Logic Hành động (Update Status) ---
const changeStatus = async (ticketId, newStatus) => {
    if (confirm(`Bạn có chắc chắn muốn thay đổi trạng thái Vé ID ${ticketId} thành ${newStatus}?`)) {
        try {
            // Gọi API cập nhật trạng thái
            await ticketService.updateTicketStatus(ticketId, newStatus);
            alert(`Đã cập nhật trạng thái vé ${ticketId} thành ${newStatus}!`);
            await fetchTickets(); // Tải lại dữ liệu sau khi cập nhật
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Cập nhật trạng thái vé thất bại.';
            alert(`Lỗi: ${errorMessage}`);
        }
    }
}

const viewPayment = (ticket) => {
    // Đây là nơi bạn sẽ mở một modal và gọi paymentService.getPaymentByTicketId(ticket.ticket_id)
    alert(`Đang xem chi tiết thanh toán cho Vé ID ${ticket.ticket_id}. (Logic gọi paymentService sẽ được thêm ở đây)`);
}

onMounted(() => {
    fetchTickets()
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
.status-badge.cancelled { background-color: #fee2e2; color: #dc2626; text-decoration: line-through; }

.action-btn { padding: 6px 10px; margin-right: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
.view-btn { background-color: #f97316; color: white; }
.cancel-btn { background-color: #dc2626; color: white; }
</style>