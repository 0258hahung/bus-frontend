<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ busData.bus_id ? 'Chỉnh sửa Xe buýt' : 'Thêm Xe buýt mới' }}</h3>
        <button @click="emit('close')" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="saveBus">
        <div class="form-group">
          <label for="license_plate">Biển số xe:</label>
          <input 
            id="license_plate" 
            v-model="busData.license_plate" 
            type="text" 
            required
            placeholder="Ví dụ: 51A-99999"
          />
        </div>

        <div class="form-group">
          <label for="driver_name">Tên Tài xế:</label>
          <input 
            id="driver_name" 
            v-model="busData.driver_name" 
            type="text" 
            required
            placeholder="Ví dụ: Nguyễn Văn Hải"
          />
        </div>
        
        <div class="form-group">
          <label>Tổng số ghế:</label>
          <p class="fixed-seat-count">25 ghế (Loại xe mặc định)</p>
        </div>
        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="cancel-btn">Hủy</button>
          <button type="submit" class="save-btn">
            {{ busData.bus_id ? 'Cập nhật' : 'Thêm mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
// src/components/admin/BusFormModal.vue (Phần Script đã chỉnh sửa)

<script setup>
import { ref, watch } from 'vue'

const DEFAULT_SEAT_COUNT = 25;

const props = defineProps({
  initialBus: {
    type: Object,
    // Thay đổi giá trị mặc định của prop
    default: () => ({ bus_id: null, license_plate: '', driver_name: '', seat_count: DEFAULT_SEAT_COUNT })
  }
})

const emit = defineEmits(['save', 'close'])

// Tạo bản sao dữ liệu. Gán cố định seat_count = 25
const busData = ref({ 
    ...props.initialBus,
    seat_count: DEFAULT_SEAT_COUNT // Gán cứng giá trị mặc định 
})

watch(() => props.initialBus, (newVal) => {
    // Khi initialBus thay đổi (chuyển từ thêm sang sửa hoặc ngược lại), 
    // chúng ta vẫn đảm bảo seat_count là 25
    busData.value = { 
        ...newVal,
        seat_count: DEFAULT_SEAT_COUNT
    }
}, { deep: true })

const saveBus = () => {
  if (!busData.value.license_plate || !busData.value.driver_name) {
      alert('Vui lòng điền đầy đủ Biển số xe và Tên tài xế.')
      return
  }
  
  // Đảm bảo gửi đi với số ghế 25, ngay cả khi có lỗi logic nào đó xảy ra
  busData.value.seat_count = DEFAULT_SEAT_COUNT; 
  emit('save', busData.value)
}
</script>

<style scoped>
/* Thêm style cho phần hiển thị số ghế cố định */
.fixed-seat-count {
    padding: 10px;
    background-color: #eef2ff; /* Nền nhẹ để làm nổi bật */
    border: 1px solid #c7d2fe;
    border-radius: 6px;
    font-weight: 700;
    color: #4f46e5;
    font-size: 16px;
    margin: 0;
}

/* Giữ nguyên các style khác */
/* ... */
</style>

<style scoped>
/* Modal Styling (giữ nguyên hoặc tương tự RouteFormModal) */
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

.modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
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
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    margin-top: 20px;
}

.cancel-btn, .save-btn {
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
}

.cancel-btn {
    background-color: #f1f1f1;
    color: #333;
    border: 1px solid #ccc;
}

.save-btn {
    background-color: #3b82f6; /* Màu xanh dương */
    color: white;
    border: none;
}

.save-btn:hover {
    background-color: #2563eb;
}
</style>