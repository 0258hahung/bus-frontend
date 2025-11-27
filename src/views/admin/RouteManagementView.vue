<template>
  <div class="route-management-view admin-content-area">
    <div class="header-actions">
      <h2>Danh sách Tuyến xe</h2>
      <button @click="openCreateModal" class="add-route-btn">
        <span class="btn-icon">➕</span>
        Thêm Tuyến xe mới
      </button>
      <button @click="exportRoutesExcel" class="export-btn">
            <span class="btn-icon">📄</span>
            Xuất Excel
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Điểm Khởi hành</th>
            <th>Điểm Đến</th>
            <th>Quãng đường (km)</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="route in routes" :key="route.route_id">
            <td>{{ route.route_id }}</td>
            <td>{{ route.departure_location }}</td>
            <td>{{ route.destination_location }}</td>
            <td>{{ route.distance_km }} km</td>
            <td>
              <button @click="editRoute(route)" class="action-btn edit-btn">Sửa</button>
              <button @click="deleteRoute(route.route_id)" class="action-btn delete-btn">Xóa</button>
            </td>
          </tr>
          <tr v-if="routes.length === 0">
              <td colspan="5" class="no-data">
                 {{ isLoading ? 'Đang tải dữ liệu...' : 'Không có tuyến xe nào được tìm thấy.' }}
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <RouteFormModal
      v-if="isModalOpen"
      :initialRoute="currentRoute"
      @save="handleSaveRoute"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RouteFormModal from '@/components/admin/RouteFormModal.vue'
import { routeService } from '@/services/routeService' // 1. IMPORT SERVICE

const routes = ref([]) // Bỏ mock data
const isModalOpen = ref(false)
const currentRoute = ref({})
const isLoading = ref(false)

// --- Logic Modal ---
const openCreateModal = () => {
    // 💡 Đảm bảo Khởi tạo distance_km là 0
    currentRoute.value = { route_id: null, departure_location: '', destination_location: '', distance_km: 0 } 
    isModalOpen.value = true
}
const editRoute = (routeData) => {
    // Sao chép dữ liệu để Sửa
    currentRoute.value = { ...routeData } 
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

// --- Logic Tải Dữ liệu (CRUD - Read) ---
const fetchRoutes = async () => {
    isLoading.value = true;
    try {
        const rawData = await routeService.getAllRoutes(); // Lấy dữ liệu từ API
        
        // 2. Ánh xạ dữ liệu từ camelCase (DB) sang snake_case (Vue Template)
        routes.value = rawData.map(r => ({
            route_id: r.routeId || r.route_id, 
            departure_location: r.departure || r.departureLocation, // Kiểm tra tên trường DB: departure hay departureLocation
            destination_location: r.destination || r.destinationLocation, // Kiểm tra tên trường DB: destination hay destinationLocation
            distance_km: r.distanceKm || r.distance_km,
        }));
        
    } catch (error) {
        console.error("Lỗi khi tải danh sách tuyến xe:", error);
        alert('Lỗi: Không thể tải dữ liệu tuyến xe.');
    } finally {
        isLoading.value = false;
    }
}

// --- Logic CRUD thực tế (Create/Update) ---
const handleSaveRoute = async (data) => {
    // 💡 KHẮC PHỤC LỖI #1: SỬ DỤNG TÊN TRƯỜNG CAMELCASE KHI GỬI LÊN
    const apiData = {
        // Ánh xạ departure_location -> departure
        departure: data.departure_location, 
        // Ánh xạ destination_location -> destination
        destination: data.destination_location, 
        
        // 🚨 SỬA TẠI ĐÂY: Ánh xạ distance_km -> distanceKm (camelCase)
        distanceKm: data.distance_km // <-- Đây là tên trường mà Java DTO mong đợi
    };
    
    try {
        if (data.route_id) {
            // Update
            await routeService.updateRoute(data.route_id, apiData);
            alert(`Cập nhật thành công tuyến xe ID ${data.route_id}!`);
        } else {
            // Create
            await routeService.createRoute(apiData);
            alert(`Thêm mới thành công tuyến xe ${data.departure_location} - ${data.destination_location}!`);
        }
        
        closeModal();
        await fetchRoutes(); // Tải lại dữ liệu sau khi lưu
        
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lưu tuyến xe thất bại.';
        alert(`Lỗi: ${errorMessage}`);
    }
}

// --- Logic Xóa (CRUD - Delete) ---
const deleteRoute = async (id) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tuyến xe ID ${id}? Việc này sẽ ảnh hưởng đến các chuyến xe đã lên lịch!`)) {
        try {
            await routeService.deleteRoute(id);
            alert(`Đã xóa tuyến xe ID ${id}.`);
            await fetchRoutes(); // Tải lại dữ liệu sau khi xóa
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Xóa tuyến xe thất bại. Có thể do ràng buộc khóa ngoại.';
            alert(`Lỗi: ${errorMessage}`);
        }
    }
}

// 4. GỌI HÀM TẢI DỮ LIỆU KHI COMPONENT ĐƯỢC LOAD
onMounted(() => {
    fetchRoutes()
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

const exportRoutesExcel = async () => {
    try {
        const data = await routeService.exportRoutes();
        downloadExcel(data, 'routes.xlsx');
    } catch (error) { console.error(error); }
};




</script>

<style scoped>
/* Style chung cho admin */
.admin-content-area {
    padding: 32px;
}
.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}
.add-route-btn {
    background-color: #10b981; /* Màu xanh lá cho Tuyến xe */
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
.add-route-btn:hover {
    background-color: #059669;
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