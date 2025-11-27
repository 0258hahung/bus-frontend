<template>
  <div class="trip-management-view admin-content-area">
    <div class="header-actions">
      <h2>Danh sách Chuyến xe</h2>
      <button @click="openCreateModal" class="add-trip-btn">
        <span class="btn-icon">➕</span>
        Thêm Chuyến xe mới
      </button>
      <button @click="exportUsersExcel" class="export-btn">
        <span class="btn-icon">📄</span>
        Xuất Excel
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tuyến xe</th>
            <th>Biển số xe</th>
            <th>Giờ Khởi hành</th>
            <th>Giá vé (VNĐ)</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trip in trips" :key="trip.trip_id">
            <td>{{ trip.trip_id }}</td>
            <td>{{ trip.route_name }}</td>
            <td>{{ trip.license_plate }}</td>
            <td>{{ formatDateTime(trip.departure_time) }}</td>
            <td>{{ formatPrice(trip.price) }}</td>
            <td><span :class="['status-badge', trip.status ? trip.status.toLowerCase() : '']">{{ trip.status }}</span></td>
            <td>
              <button @click="editTrip(trip)" class="action-btn edit-btn">Sửa</button>
              <button @click="cancelTrip(trip.trip_id)" 
                      v-if="trip.status === 'SCHEDULED' || trip.status === 'RUNNING'"
                      class="action-btn delete-btn">Hủy</button>
            </td>
          </tr>
          <tr v-if="trips.length === 0">
              <td colspan="7" class="no-data">
                {{ isLoading ? 'Đang tải dữ liệu...' : 'Không có chuyến xe nào được tìm thấy.' }}
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TripFormModal
      v-if="isModalOpen"
      :initialTrip="currentTrip"
      :buses="buses"  :routes="routes" @save="handleSaveTrip"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TripFormModal from '@/components/admin/TripFormModal.vue'
import { tripService } from '@/services/tripService' // Import Trip Service
import { routeService } from '@/services/routeService' // Import Route Service
import { busService } from '@/services/busService' // Import Bus Service

const trips = ref([])
const routes = ref([]) // Dữ liệu Routes cho Form Modal
const buses = ref([])  // Dữ liệu Buses cho Form Modal
const isModalOpen = ref(false)
const currentTrip = ref({})
const isLoading = ref(false)

// --- Hàm tiện ích ---
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        // ✅ Buộc hiển thị theo múi giờ Việt Nam
        return new Intl.DateTimeFormat('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            timeZone: 'Asia/Ho_Chi_Minh' 
        }).format(new Date(isoString))
    } catch {
        return 'Invalid Date';
    }
}

// src/views/admin/TripManagementView.vue (Sửa hàm formatForInput)

// src/views/admin/TripManagementView.vue

const formatForInput = (isoString) => {
    if (!isoString) return '';
    // ✅ FIX LỖI SAI GIỜ KHI SỬA: Cắt chuỗi thô để input đọc giờ đơn giản nhất.
    // Lấy chính xác YYYY-MM-DDTHH:MM (16 ký tự đầu tiên)
    return isoString.slice(0, 16); 
}
const formatPrice = (price) => {
    if (price === null || price === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(price)
}

// --- Logic Tải Dữ liệu (Đồng thời) ---
const fetchDependencies = async () => {
    try {
        // Tải Routes và Buses song song (dùng Promise.all)
        const [routesData, busesData] = await Promise.all([
            routeService.getAllRoutes(),
            busService.getAllBuses()
        ]);

        // Ánh xạ Routes (Giả định DTO dùng departure, destination)
        routes.value = routesData.map(r => ({
            route_id: r.routeId || r.route_id, 
            departure: r.departure, 
            destination: r.destination,
            // Thêm route_name để tiện hiển thị
            route_name: `${r.departure} - ${r.destination}`
        }));
        
        // Ánh xạ Buses (Giả định DTO dùng licensePlate, driverName)
        buses.value = busesData.map(b => ({
            bus_id: b.busId || b.bus_id, 
            license_plate: b.licensePlate,
            driver_name: b.driverName,
        }));

    } catch (e) {
        console.error("Lỗi khi tải Routes/Buses:", e);
    }
}

const fetchTrips = async () => {
    isLoading.value = true;
    try {
        const rawData = await tripService.getAllTrips();
        
        // Ánh xạ và bổ sung thông tin hiển thị (route_name, license_plate)
        trips.value = rawData.map(t => {
            // Logic quan trọng: Tìm tên tuyến và biển số xe từ dữ liệu đã tải
            const route = routes.value.find(r => r.route_id === t.routeId);
            const bus = buses.value.find(b => b.bus_id === t.busId);
            
            return {
                trip_id: t.tripId || t.trip_id,
                route_id: t.routeId || t.route_id,
                bus_id: t.busId || t.bus_id,
                
                // Fields hiển thị (được join hoặc bổ sung)
                route_name: route ? route.route_name : 'N/A',
                license_plate: bus ? bus.license_plate : 'N/A',

                departure_time: t.departureTime || t.departure_time,
                arrival_time: t.arrivalTime || t.arrival_time,
                price: t.price,
                status: t.status,
            };
        });

    } catch (error) {
        console.error("Lỗi khi tải danh sách chuyến xe:", error);
        alert('Lỗi: Không thể tải dữ liệu chuyến xe.');
    } finally {
        isLoading.value = false;
    }
}

// --- Logic Modal & CRUD Thực tế ---

const openCreateModal = () => {
    // 💡 Đảm bảo Khởi tạo giá trị thời gian hợp lệ cho input datetime-local
    const now = new Date();
    // Lấy YYYY-MM-DDTHH:MM (format này làm việc tốt nhất với input datetime-local)
    // Sẽ thêm một giờ để tránh lỗi thời gian quá khứ (past time)
    const future = new Date(now.getTime() + (60 * 60 * 1000)); 
    const formattedFuture = new Date(future.getTime() - (future.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    
    currentTrip.value = { 
        trip_id: null, 
        route_id: null, 
        bus_id: null, 
        departure_time: formattedFuture, // ✅ Giờ bắt đầu trong 1 giờ tới
        arrival_time: '', 
        price: null, 
        status: 'SCHEDULED' 
    }
    isModalOpen.value = true
}


const editTrip = (tripData) => {
    currentTrip.value = { 
        ...tripData,
        // ✅ Gọi hàm đã sửa
        departure_time: formatForInput(tripData.departure_time),
        arrival_time: formatForInput(tripData.arrival_time),
    } 
    isModalOpen.value = true
}
const closeModal = () => {
    isModalOpen.value = false
}

const handleSaveTrip = async (data) => {
    // 3. TẠO ĐỐI TƯỢNG DỮ LIỆU GỬI LÊN API (SỬ DỤNG CAMELCASE)
    const apiData = {
        // Ánh xạ route_id -> routeId
        routeId: data.route_id,
        // Ánh xạ bus_id -> busId
        busId: data.bus_id,
        
        // Ánh xạ departure_time -> departureTime
        departureTime: data.departure_time,
        // Ánh xạ arrival_time -> arrivalTime
        arrivalTime: data.arrival_time,
        
        // Giá vé và trạng thái (giả định khớp)
        price: data.price,
        status: data.status
    };

    try {
        if (data.trip_id && data.trip_id > 0) { 
            // Update
            // Cần gửi cả ID qua URL và trong body (tuỳ thuộc vào Controller Java)
            await tripService.updateTrip(data.trip_id, apiData); 
            alert(`Cập nhật thành công chuyến xe ID ${data.trip_id}!`);
        } else {
            // Create
            await tripService.createTrip(apiData);
            alert(`Thêm mới thành công chuyến xe!`);
        }
        
        closeModal() // <-- [A] Nếu thành công, Modal sẽ đóng
        await fetchTrips(); 
    } catch (error) {
        // 🚨 QUAN TRỌNG: In lỗi để xem Backend báo lỗi gì
        const errorMessage = error.response?.data?.message || 'Lưu chuyến xe thất bại (Kiểm tra Log Console).';
        console.error("Trip Save Error:", error);
        alert(`Lỗi: ${errorMessage}`); // <-- Hiển thị lỗi rõ ràng
    }
}

const cancelTrip = async (tripId) => {
    if (confirm(`...`)) {
        try {
            // 🛑 THAY THẾ bằng method mới
            await tripService.cancelTripById(tripId); 
            
            alert(`Đã hủy thành công chuyến xe ID ${tripId}.`);
            await fetchTrips();
        } catch (error) {
            // ...
        }
    }
}
onMounted(async () => {
    // Tải Routes và Buses trước
    await fetchDependencies();
    // Sau đó tải Trips
    await fetchTrips();
})

import api from '@/services/api' // Hoặc path tới api chung nếu có

const downloadExcel = (blobData, fileName) => {
    const blob = new Blob([blobData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const exportTripsExcel = async () => {
    try {
        const data = await tripService.exportTrips();
        downloadExcel(data, 'trips.xlsx');
    } catch (error) { console.error(error); }
};


</script>

<style scoped>
/* Dùng lại styles chung */
.admin-content-area {
    padding: 32px;
}
.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}
.table-container {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow-x: auto;
}
.data-table {
    width: 100%;
    border-collapse: collapse;
}
.data-table th, .data-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}
.data-table th {
    background-color: #f4f4f4;
}
.add-trip-btn {
    background-color: #f97316; /* Màu Cam đậm */
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}
/* Status Badges */
.status-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
}
.status-badge.scheduled {
    background-color: #eff6ff;
    color: #2563eb;
}
.status-badge.running {
    background-color: #fef3c7;
    color: #fbbf24;
}
.status-badge.finished {
    background-color: #d1fae5;
    color: #059669;
}
.status-badge.cancelled {
    background-color: #fee2e2;
    color: #dc2626;
    text-decoration: line-through;
}
.edit-btn { background-color: #2563eb; color: white; }
.delete-btn { background-color: #dc2626; color: white; }
.action-btn { padding: 6px 10px; margin-right: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
</style>