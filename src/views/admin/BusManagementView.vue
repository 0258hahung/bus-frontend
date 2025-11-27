<!-- src/views/admin/BusManagementView.vue -->
<template>
  <div class="bus-management-view admin-content-area">
    <div class="header-actions">
      <h2>Danh sách Xe buýt</h2>
      <button @click="openCreateModal" class="add-bus-btn">
        <span class="btn-icon">🚌</span>
        Thêm Xe buýt mới
      </button>
      <button @click="exportBusesExcel" class="export-btn">
            <span class="btn-icon">📄</span>
            Xuất Excel
      </button>

    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Biển số xe</th>
            <th>Tên tài xế</th>
            <th>Tổng số ghế</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <!-- Lặp qua dữ liệu đã tải từ API -->
          <tr v-for="bus in buses" :key="bus.bus_id">
            <td>{{ bus.bus_id }}</td>
            <td>{{ bus.license_plate }}</td>
            <td>{{ bus.driver_name }}</td>
            <td>{{ bus.seat_count }}</td>
            <td>{{ formatDateTime(bus.created_at) }}</td>
            <td>
              <button @click="editBus(bus)" class="action-btn edit-btn">Sửa</button>
              <button @click="deleteBus(bus.bus_id)" class="action-btn delete-btn">Xóa</button>
            </td>
          </tr>
          <tr v-if="buses.length === 0">
              <td colspan="6" class="no-data">
                {{ isLoading ? 'Đang tải dữ liệu...' : 'Không có xe buýt nào được tìm thấy.' }}
              </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <BusFormModal
      v-if="isModalOpen"
      :initialBus="currentBus"
      @save="handleSaveBus"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BusFormModal from '@/components/admin/BusFormModal.vue'
import { busService } from '@/services/busService' // 1. IMPORT SERVICE MỚI

const buses = ref([]) // Bắt đầu bằng mảng rỗng
const isModalOpen = ref(false)
const currentBus = ref({})
const isLoading = ref(false)
const DEFAULT_SEAT_COUNT = 25; // Ghế cố định

// --- Hàm tiện ích ---
const formatDateTime = (dateString) => {
    // Chỉ hiển thị ngày tạo
    if (!dateString) return 'N/A';
    try {
        // New Date() có thể xử lý chuỗi ISO 8601
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
        console.error("Lỗi định dạng ngày:", e);
        return 'Format Error';
    }
}

// --- Logic Tải Dữ liệu (CRUD - Read) ---
const fetchBuses = async () => {
    isLoading.value = true;
    try {
        const rawData = await busService.getAllBuses(); // rawData là mảng từ Spring Boot (camelCase)
        
        // **Ánh xạ dữ liệu từ camelCase sang snake_case**
        buses.value = rawData.map(bus => ({
            // 💡 Cần kiểm tra Backend dùng 'busId' hay 'id'
            bus_id: bus.busId || bus.id || bus.bus_id, 
            
            // Ánh xạ các trường
            license_plate: bus.licensePlate || bus.license_plate, 
            driver_name: bus.driverName || bus.driver_name,
            seat_count: bus.seatCount || bus.seat_count,
            created_at: bus.createdAt || bus.created_at, // Ánh xạ thời gian
        }));
        
        console.log("Bus data ASIGNED and MAPPED:", buses.value);
        
    } catch (error) {
        // ... (logic xử lý lỗi)
    } finally {
        isLoading.value = false;
    }
}

// --- Logic Modal ---
const openCreateModal = () => {
    // 5. Đặt seat_count mặc định là 25
    currentBus.value = { bus_id: null, license_plate: '', driver_name: '', seat_count: DEFAULT_SEAT_COUNT } 
    isModalOpen.value = true
}

const editBus = (busData) => {
    // 6. Đảm bảo dữ liệu sửa cũng có seat_count là 25 (từ DB)
    currentBus.value = { ...busData } 
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

// --- Logic CRUD thực tế (Create/Update) ---
const handleSaveBus = async (data) => {
    // 7. TẠO ĐỐI TƯỢNG GỬI LÊN API SỬ DỤNG CAMELCASE ĐỂ KHỚP VỚI JAVA DTO
    const apiData = {
        // ÁNH XẠ: license_plate (Vue) -> licensePlate (Java DTO)
        licensePlate: data.license_plate, // <--- SỬA TẠI ĐÂY
        
        // ÁNH XẠ: driver_name (Vue) -> driverName (Java DTO)
        driverName: data.driver_name,     // <--- SỬA TẠI ĐÂY

        seatCount: DEFAULT_SEAT_COUNT,    // seat_count -> seatCount
    };
    
    try {
        if (data.bus_id) {
            // Cập nhật (Update)
            await busService.updateBus(data.bus_id, apiData);
            alert(`Cập nhật thành công xe ${data.license_plate}!`);
        } else {
            // Thêm mới (Create)
            await busService.createBus(apiData); // Dữ liệu apiData đã đúng định dạng Java
            alert(`Thêm mới thành công xe ${data.license_plate}!`);
        }
        
        closeModal();
        await fetchBuses();

    } catch (error) {
        // Lỗi từ API (Ví dụ: 400 Bad Request, Biển số xe đã tồn tại)
        const errorMessage = error.response?.data?.message || 'Lưu xe buýt thất bại.';
        alert(`Lỗi: ${errorMessage}`);
    }
}

// --- Logic Xóa (CRUD - Delete) ---
const deleteBus = async (id) => {
    if (confirm(`Bạn có chắc chắn muốn xóa xe buýt ID ${id}? Việc này có thể ảnh hưởng đến các chuyến xe đã lên lịch!`)) {
        try {
            await busService.deleteBus(id);
            alert(`Đã xóa xe buýt ID ${id}.`);
            // 9. TẢI LẠI DỮ LIỆU SAU KHI XÓA
            await fetchBuses(); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Xóa xe buýt thất bại. Có thể do ràng buộc khóa ngoại.';
            alert(`Lỗi: ${errorMessage}`);
        }
    }
}

// 4. GỌI HÀM TẢI DỮ LIỆU KHI COMPONENT ĐƯỢC LOAD
onMounted(() => {
    fetchBuses()
})

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

const exportBusesExcel = async () => {
    try {
        const data = await busService.exportBuses();
        downloadExcel(data, 'buses.xlsx');
    } catch (error) { console.error(error); }
};


</script>

<style scoped>
/* Sử dụng lại các style chung cho trang admin */
.admin-content-area {
    padding: 32px;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.add-bus-btn {
    background-color: #3b82f6; /* Màu xanh dương cho Xe buýt */
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.add-bus-btn:hover {
    background-color: #2563eb;
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
    font-size: 15px;
}

.data-table th, .data-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.data-table th {
    background-color: #f4f4f4;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
}

.data-table tbody tr:hover {
    background-color: #f9f9f9;
}

.action-btn {
    padding: 6px 10px;
    margin-right: 8px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;
}

.edit-btn {
    background-color: #2563eb;
    color: white;
}

.delete-btn {
    background-color: #dc2626;
    color: white;
}

.action-btn:hover {
    opacity: 0.85;
}

.no-data {
    text-align: center;
    padding: 20px;
    color: #999;
    font-style: italic;
}
</style>