<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ tripData.trip_id ? 'Chỉnh sửa Chuyến xe' : 'Thêm Chuyến xe mới' }}</h3>
        <button @click="emit('close')" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="saveTrip">
        <div class="form-group">
          <label for="route_id">Tuyến xe:</label>
          <select id="route_id" v-model.number="tripData.route_id" required>
            <option :value="null" disabled>-- Chọn Tuyến xe --</option>
            <option v-for="route in routes" :key="route.route_id" :value="route.route_id">
              {{ route.departure }} - {{ route.destination }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="bus_id">Xe buýt:</label>
          <select id="bus_id" v-model.number="tripData.bus_id" required>
            <option :value="null" disabled>-- Chọn Biển số xe --</option>
            <option v-for="bus in buses" :key="bus.bus_id" :value="bus.bus_id">
              {{ bus.license_plate }} ({{ bus.driver_name }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="departure_time">Giờ Khởi hành:</label>
          <input 
            id="departure_time" 
            v-model="tripData.departure_time" 
            type="datetime-local" 
            required
          />
        </div>

        <div class="form-group">
          <label for="arrival_time">Giờ Dự kiến Đến:</label>
          <input 
            id="arrival_time" 
            v-model="tripData.arrival_time" 
            type="datetime-local" 
          />
        </div>

        <div class="form-group">
          <label for="price">Giá vé (VNĐ):</label>
          <input 
            id="price" 
            v-model.number="tripData.price" 
            type="number" 
            required
            min="1000"
          />
        </div>

        <div class="form-group" v-if="tripData.trip_id">
          <label for="status">Trạng thái:</label>
          <select id="status" v-model="tripData.status" required>
            <option value="SCHEDULED">SCHEDULED (Lên lịch)</option>
            <option value="RUNNING">RUNNING (Đang chạy)</option>
            <option value="FINISHED">FINISHED (Đã kết thúc)</option>
            <option value="CANCELLED">CANCELLED (Đã hủy)</option>
          </select>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="cancel-btn">Hủy</button>
          <button type="submit" class="save-btn">
            {{ tripData.trip_id ? 'Cập nhật' : 'Thêm mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialTrip: {
    type: Object,
    default: () => ({ trip_id: null, route_id: null, bus_id: null, departure_time: '', arrival_time: '', price: null, status: 'SCHEDULED' })
  },
  routes: { type: Array, required: true },
  buses: { type: Array, required: true }
})

const emit = defineEmits(['save', 'close'])

// Chuyển đổi định dạng DATETIME của DB sang định dạng input datetime-local yêu cầu (YYYY-MM-DDThh:mm)
const formatForInput = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    // Lấy YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16)
}

const tripData = ref({
    ...props.initialTrip,
    // Đảm bảo thời gian được định dạng đúng cho input
    departure_time: formatForInput(props.initialTrip.departure_time),
    arrival_time: formatForInput(props.initialTrip.arrival_time),
})

watch(() => props.initialTrip, (newVal) => {
    tripData.value = { 
        ...newVal,
        departure_time: formatForInput(newVal.departure_time),
        arrival_time: formatForInput(newVal.arrival_time),
    }
}, { deep: true })

const saveTrip = () => {
  // Thực hiện validate cơ bản
  if (!tripData.value.route_id || !tripData.value.bus_id || !tripData.value.departure_time || !tripData.value.price) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
  }
  emit('save', tripData.value)
}
</script>

<style scoped>
/* Dùng lại Modal Styles chung, chỉ chỉnh Save button color */
.modal-header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 20px;
}
.modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background-color: rgba(0, 0, 0, 0.6); display: flex; 
    justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
    background: white; padding: 25px; border-radius: 12px; width: 90%;
    max-width: 500px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; color: #555; font-size: 14px; }
.form-group input, .form-group select {
    width: 100%; padding: 10px; border: 1px solid #ddd; 
    border-radius: 6px; box-sizing: border-box; font-size: 16px; 
}
.form-group input:focus, .form-group select:focus {
    border-color: #f97316; outline: none; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 20px;}
.cancel-btn { background-color: #f1f1f1; color: #333; border: 1px solid #ccc; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }

.save-btn {
    background-color: #f97316; /* Màu Cam đậm */
    color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; 
}
.save-btn:hover { background-color: #ea580c; }
.close-btn{
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
}
.close-btn:hover {
    color: #666;
}
</style>