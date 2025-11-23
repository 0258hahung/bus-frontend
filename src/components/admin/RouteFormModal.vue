<!-- src/components/admin/RouteFormModal.vue (CẬP NHẬT HOÀN TOÀN) -->
<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ routeData.route_id ? 'Chỉnh sửa Tuyến xe' : 'Thêm Tuyến xe mới' }}</h3>
        <button @click="emit('close')" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="saveRoute">
        <div class="form-group">
          <label for="departure_location">Điểm Khởi hành:</label>
          <input 
            id="departure_location" 
            v-model="routeData.departure_location" 
            type="text" 
            required
            placeholder="Ví dụ: TP. Hồ Chí Minh"
          />
        </div>

        <div class="form-group">
          <label for="destination_location">Điểm Đến:</label>
          <input 
            id="destination_location" 
            v-model="routeData.destination_location" 
            type="text" 
            required
            placeholder="Ví dụ: Nha Trang"
          />
        </div>

        <div class="form-group">
          <label for="distance_km">Quãng đường (km):</label>
          <input 
            id="distance_km" 
            v-model.number="routeData.distance_km" 
            type="number" 
            required
            min="1"
          />
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="cancel-btn">Hủy</button>
          <button type="submit" class="save-btn">
            {{ routeData.route_id ? 'Cập nhật' : 'Thêm mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialRoute: {
    type: Object,
    // Khởi tạo mặc định là 0 để tránh gửi NULL khi chưa nhập
    default: () => ({ route_id: null, departure_location: '', destination_location: '', distance_km: 0 }) 
  }
})

const emit = defineEmits(['save', 'close'])

// Tạo bản sao dữ liệu, đảm bảo giá trị là số
const routeData = ref({ 
    ...props.initialRoute,
    distance_km: props.initialRoute.distance_km || 0
})

watch(() => props.initialRoute, (newVal) => {
    routeData.value = { 
        ...newVal,
        distance_km: newVal.distance_km || 0
    }
}, { deep: true })

const saveRoute = () => {
    // V-model.number có thể trả về NULL nếu xóa sạch input, cần kiểm tra lại
    if (routeData.value.distance_km === null || routeData.value.distance_km <= 0) {
        alert('Quãng đường phải là một số dương (lớn hơn 0).');
        return;
    }
    
    // Kiểm tra các trường text khác
    if (!routeData.value.departure_location || !routeData.value.destination_location) {
        alert('Vui lòng điền đầy đủ Điểm đi và Điểm đến.');
        return;
    }
    
    emit('save', routeData.value)
}
</script>

<style scoped>
/* Modal Styling chung */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-content {
    background: white;
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 20px;
}
.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
}
.close-btn:hover {
    color: #666;
}
.form-group {
    margin-bottom: 18px;
}
.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #555;
    font-size: 14px;
}
.form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 16px;
    transition: border-color 0.2s;
}
.form-group input:focus {
    border-color: #10b981; /* Màu xanh lá */
    outline: none;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    margin-top: 20px;
}
.cancel-btn {
    background-color: #f1f1f1;
    color: #333;
    border: 1px solid #ccc;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
.save-btn {
    background-color: #10b981; /* Màu xanh lá */
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
.save-btn:hover {
    background-color: #059669;
}
</style>