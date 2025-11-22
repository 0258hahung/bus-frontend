<template>
  <div>
    <AdminSidebar />
    <div class="admin-container">
      <div class="admin-header">
        <h1>Quản Lý Chuyến Xe</h1>
      </div>

      <div class="admin-content">
        <div class="card">
          <h2 style="color:#e67e22;margin-top:0">{{ editingTrip ? 'Sửa Chuyến Xe' : 'Thêm Chuyến Xe Mới' }}</h2>
          <form @submit.prevent="saveTrip">
            <table width="100%">
              <tr>
                <td width="20%"><strong>Tuyến xe</strong></td>
                <td>
                  <select v-model="form.routeId" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
                    <option value="">-- Chọn tuyến --</option>
                    <option v-for="r in routes" :key="r.routeId" :value="r.routeId">
                      {{ r.startLocation }} → {{ r.endLocation }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr>
                <td><strong>Xe</strong></td>
                <td>
                  <select v-model="form.busId" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;">
                    <option value="">-- Chọn xe --</option>
                    <option v-for="b in buses" :key="b.busId" :value="b.busId">
                      {{ b.licensePlate }} - {{ b.busType || 'Giường nằm' }}
                    </option>
                  </select>
                </td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr>
                <td><strong>Ngày & Giờ đi</strong></td>
                <td>
                  <input v-model="form.departureDate" type="date" required style="width:48%;padding:10px;border:1px solid #ddd;border-radius:6px;" />
                  <input v-model="form.departureTime" type="time" required style="width:48%;margin-left:4%;padding:10px;border:1px solid #ddd;border-radius:6px;" />
                </td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr>
                <td><strong>Giá vé (VNĐ)</strong></td>
                <td><input v-model.number="form.price" type="number" required placeholder="250000" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" /></td>
              </tr>
              <tr><td colspan="2" height="20"></td></tr>
              <tr>
                <td></td>
                <td>
                  <button type="submit" class="btn btn-primary" style="padding:12px 30px;font-size:16px;">
                    {{ editingTrip ? 'Cập Nhật' : 'Thêm Chuyến' }}
                  </button>
                  <button v-if="editingTrip" type="button" @click="cancelEdit" class="btn" style="background:#95a5a6;margin-left:10px;padding:12px 25px;">
                    Hủy
                  </button>
                </td>
              </tr>
            </table>
          </form>

          <div v-if="success" style="padding:15px;background:#d5f4e6;border-radius:6px;margin:20px 0;color:#27ae60;">{{ success }}</div>
          <div v-if="error" style="padding:15px;background:#fadbd8;border-radius:6px;margin:20px 0;color:#c0392b;">{{ error }}</div>

          <h2 style="color:#e67e22;margin:30px 0 15px;">Danh Sách Chuyến Xe ({{ trips.length }})</h2>
          <table width="100%" style="background:white;border-collapse:collapse;">
            <tr style="background:#f8f9fa;">
              <th style="padding:15px;text-align:left;">Tuyến</th>
              <th style="padding:15px;text-align:left;">Xe</th>
              <th style="padding:15px;text-align:left;">Ngày đi</th>
              <th style="padding:15px;text-align:left;">Giá</th>
              <th style="padding:15px;text-align:center;">Hành động</th>
            </tr>
            <tr v-for="t in trips" :key="t.tripId" style="border-bottom:1px solid #eee;">
              <td style="padding:15px;font-weight:bold;color:#e67e22;">{{ getRouteName(t.routeId) }}</td>
              <td style="padding:15px;">{{ getBusName(t.busId) }}</td>
              <td style="padding:15px;">{{ formatDate(t.departureTime) }} {{ t.departureTime?.substring(11,16) }}</td>
              <td style="padding:15px;">{{ formatPrice(t.price) }}đ</td>
              <td style="padding:15px;text-align:center;">
                <button @click="editTrip(t)" class="btn" style="background:#3498db;padding:8px 15px;margin:0 5px;">Sửa</button>
                <button @click="confirmDelete(t)" class="btn btn-danger" style="padding:8px 15px;margin:0 5px;">Xóa</button>
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

const trips = ref([])
const routes = ref([])
const buses = ref([])
const form = ref({
  tripId: null, routeId: '', busId: '', departureDate: '', departureTime: '', price: 0
})
const editingTrip = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(() => loadAll())

const loadAll = async () => {
  loading.value = true
  try {
    const [t, r, b] = await Promise.all([
      api.get('/trips'), api.get('/routes'), api.get('/buses')
    ])
    trips.value = t.data.data || []
    routes.value = r.data.data || []
    buses.value = b.data.data || []
  } catch (err) {
    error.value = 'Không tải được dữ liệu'
  } finally {
    loading.value = false
  }
}

const saveTrip = async () => {
  const departureTime = `${form.value.departureDate}T${form.value.departureTime}:00`
  const payload = {
    routeId: form.value.routeId,
    busId: form.value.busId,
    departureTime,
    price: form.value.price
  }

  try {
    if (editingTrip.value) {
      await api.put(`/trips/${form.value.tripId}`, payload)
      success.value = 'Cập nhật chuyến thành công!'
    } else {
      await api.post('/trips', payload)
      success.value = 'Thêm chuyến thành công!'
    }
    await loadAll()
    resetForm()
  } catch (err) {
    error.value = err.response?.data?.message || 'Lỗi lưu chuyến'
  }
}

const editTrip = (trip) => {
  editingTrip.value = trip
  const date = trip.departureTime.substring(0,10)
  const time = trip.departureTime.substring(11,16)
  form.value = {
    tripId: trip.tripId,
    routeId: trip.routeId,
    busId: trip.busId,
    departureDate: date,
    departureTime: time,
    price: trip.price
  }
}

const cancelEdit = () => { editingTrip.value = null; resetForm() }
const confirmDelete = (t) => { if(confirm('Xóa chuyến này?')) deleteTrip(t.tripId) }

const deleteTrip = async (id) => {
  try {
    await api.delete(`/trips/${id}/cancel`)
    success.value = 'Xóa chuyến thành công!'
    await loadAll()
  } catch (err) {
    error.value = 'Xóa thất bại'
  }
}

const resetForm = () => {
  form.value = { tripId: null, routeId: '', busId: '', departureDate: '', departureTime: '', price: 0 }
  editingTrip.value = null
}

const getRouteName = (id) => routes.value.find(r => r.routeId === id)?.startLocation + ' → ' + routes.value.find(r => r.routeId === id)?.endLocation || 'N/A'
const getBusName = (id) => buses.value.find(b => b.busId === id)?.licensePlate || 'N/A'
const formatPrice = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN')
</script>

<style scoped>
@import '@/assets/css/admin.css';
</style>