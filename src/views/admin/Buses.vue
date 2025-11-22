<template>
  <div>
    <AdminSidebar />
    <div class="admin-container">
      <div class="admin-header">
        <h1>Quản Lý Xe</h1>
      </div>

      <div class="admin-content">
        <div class="card">
          <h2 style="color:#e67e22;margin-top:0">Thêm Xe Mới</h2>
          <form @submit.prevent="addBus">
            <table width="100%">
              <tr><td width="20%"><strong>Biển số</strong></td><td><input v-model="newBus.licensePlate" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" /></td></tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr><td><strong>Loại xe</strong></td><td>
                <select v-model="newBus.busType" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
                  <option>Giường nằm</option>
                  <option>Ghế ngồi</option>
                  <option>Limousine</option>
                </select>
              </td></tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr><td><strong>Số ghế</strong></td><td><input v-model.number="newBus.seatCapacity" type="number" required min="16" max="45" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" /></td></tr>
              <tr><td colspan="2" height="20"></td></tr>
              <tr><td></td><td><button type="submit" class="btn btn-primary" style="padding:12px 30px;">Thêm Xe</button></td></tr>
            </table>
          </form>

          <h2 style="color:#e67e22;margin:40px 0 15px;">Danh Sách Xe ({{ buses.length }})</h2>
          <table width="100%" style="background:white;border-collapse:collapse;">
            <tr style="background:#f8f9fa;">
              <th style="padding:15px;text-align:left;">Biển số</th>
              <th style="padding:15px;text-align:left;">Loại xe</th>
              <th style="padding:15px;text-align:left;">Số ghế</th>
              <th style="padding:15px;text-align:center;">Hành động</th>
            </tr>
            <tr v-for="b in buses" :key="b.busId" style="border-bottom:1px solid #eee;">
              <td style="padding:15px;font-weight:bold;color:#e67e22;">{{ b.licensePlate }}</td>
              <td style="padding:15px;">{{ b.busType || 'Giường nằm' }}</td>
              <td style="padding:15px;">{{ b.seatCapacity }} ghế</td>
              <td style="padding:15px;text-align:center;">
                <button @click="removeBus(b.busId)" class="btn btn-danger" style="padding:8px 15px;">Xóa</button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import api from '@/services/api.js'

const buses = ref([])
const newBus = ref({ licensePlate: '', busType: 'Giường nằm', seatCapacity: 34 })

onMounted(() => loadBuses())

const loadBuses = async () => {
  const res = await api.get('/buses')
  buses.value = res.data.data || []
}

const addBus = async () => {
  try {
    await api.post('/buses', newBus.value)
    alert('Thêm xe thành công!')
    newBus.value = { licensePlate: '', busType: 'Giường nằm', seatCapacity: 34 }
    await loadBuses()
  } catch (err) {
    alert('Lỗi: ' + (err.response?.data?.message || ''))
  }
}

const removeBus = async (id) => {
  if (confirm('Xóa xe này?')) {
    await api.delete(`/buses/${id}`)
    await loadBuses()
  }
}
</script>

<style scoped>
@import '@/assets/css/admin.css';
</style>