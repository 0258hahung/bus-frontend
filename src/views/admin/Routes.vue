<template>
  <div>
    <AdminSidebar />
    <div class="admin-container">
      <div class="admin-header">
        <h1>Quản Lý Tuyến Xe</h1>
      </div>

      <div class="admin-content">
        <!-- Form thêm/sửa tuyến -->
        <div class="card">
          <h2 style="color:#e67e22;margin-top:0">
            {{ editingRoute ? 'Sửa Tuyến Xe' : 'Thêm Tuyến Xe Mới' }}
          </h2>
          <form @submit.prevent="saveRoute" style="margin-bottom:25px;">
            <table width="100%">
              <tr>
                <td width="20%"><strong>Điểm đi</strong></td>
                <td><input v-model="form.startLocation" required placeholder="TP. Hồ Chí Minh" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" /></td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr>
                <td><strong>Điểm đến</strong></td>
                <td><input v-model="form.endLocation" required placeholder="Đà Lạt" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" /></td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr>
                <td><strong>Khoảng cách (km)</strong></td>
                <td><input v-model.number="form.distanceKm" type="number" required placeholder="320" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:6px;" /></td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr>
                <td><strong>Thời gian ước tính</strong></td>
                <td>
                  <input v-model.number="form.hours" type="number" min="0" style="width:80px;padding:10px;border:1px solid #ddd;border-radius:6px;" /> giờ
                  <input v-model.number="form.minutes" type="number" min="0" max="59" style="width:80px;padding:10px;border:1px solid #ddd;border-radius:6px;margin-left:10px;" /> phút
                </td>
              </tr>
              <tr><td colspan="2" height="20"></td></tr>
              <tr>
                <td></td>
                <td>
                  <button type="submit" class="btn btn-primary" style="padding:12px 30px;font-size:16px;">
                    {{ editingRoute ? 'Cập Nhật' : 'Thêm Tuyến' }}
                  </button>
                  <button v-if="editingRoute" type="button" @click="cancelEdit" class="btn" style="background:#95a5a6;margin-left:10px;padding:12px 25px;">
                    Hủy
                  </button>
                </td>
              </tr>
            </table>
          </form>

          <div v-if="success" style="padding:15px;background:#d5f4e6;border-radius:6px;margin-bottom:20px;color:#27ae60;">
            {{ success }}
          </div>
          <div v-if="error" style="padding:15px;background:#fadbd8;border-radius:6px;margin-bottom:20px;color:#c0392b;">
            {{ error }}
          </div>

          <!-- Danh sách tuyến -->
          <h2 style="color:#e67e22;margin:30px 0 15px;">Danh Sách Tuyến Xe ({{ routes.length }})</h2>
          <div v-if="loading" style="text-align:center;padding:40px;">
            <div style="display:inline-block;width:50px;height:50px;border:5px solid #f3f3f3;border-top:5px solid #e67e22;border-radius:50%;animation:spin 1s linear infinite;"></div>
          </div>
          <table v-else width="100%" style="background:white;border-collapse:collapse;">
            <tr style="background:#f8f9fa;">
              <th style="padding:15px;text-align:left;border-bottom:2px solid #eee;">Tuyến</th>
              <th style="padding:15px;text-align:left;border-bottom:2px solid #eee;">Khoảng cách</th>
              <th style="padding:15px;text-align:left;border-bottom:2px solid #eee;">Thời gian</th>
              <th style="padding:15px;text-align:center;border-bottom:2px solid #eee;">Hành động</th>
            </tr>
            <tr v-for="r in routes" :key="r.routeId" style="border-bottom:1px solid #eee;">
              <td style="padding:15px;font-weight:bold;color:#e67e22;">
                {{ r.startLocation }} → {{ r.endLocation }}
              </td>
              <td style="padding:15px;">{{ r.distanceKm }} km</td>
              <td style="padding:15px;">{{ formatTime(r.estimatedTime) }}</td>
              <td style="padding:15px;text-align:center;">
                <button @click="editRoute(r)" class="btn" style="background:#3498db;padding:8px 15px;margin:0 5px;">Sửa</button>
                <button @click="confirmDelete(r)" class="btn btn-danger" style="padding:8px 15px;margin:0 5px;">Xóa</button>
              </td>
            </tr>
          </table>
          <div v-if="!loading && routes.length === 0" style="text-align:center;padding:50px;color:#999;">
            Chưa có tuyến xe nào
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận xóa -->
    <div v-if="showDeleteModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;">
      <div style="background:white;padding:30px;border-radius:10px;max-width:400px;width:90%;">
        <h3 style="margin-top:0;color:#c0392b;">Xác nhận xóa tuyến</h3>
        <p>Bạn có chắc chắn muốn xóa tuyến <strong>{{ routeToDelete?.startLocation }} → {{ routeToDelete?.endLocation }}</strong>?</p>
        <div style="text-align:right;margin-top:20px;">
          <button @click="showDeleteModal=false" class="btn" style="background:#95a5a6;margin-right:10px;">Hủy</button>
          <button @click="deleteRoute" class="btn btn-danger">Xóa ngay</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import api from '@/services/api.js'

const routes = ref([])
const form = ref({ routeId: null, startLocation: '', endLocation: '', distanceKm: 0, hours: 0, minutes: 0 })
const editingRoute = ref(null)
const loading = ref(false)
const error = ref('')
const success = ref('')
const showDeleteModal = ref(false)
const routeToDelete = ref(null)

onMounted(() => loadRoutes())

const loadRoutes = async () => {
  loading.value = true
  try {
    const res = await api.get('/routes')
    routes.value = res.data.data || []
  } catch (err) {
    error.value = 'Không tải được danh sách tuyến'
  } finally {
    loading.value = false
  }
}

const saveRoute = async () => {
  error.value = success.value = ''
  const time = `${String(form.value.hours).padStart(2,'0')}:${String(form.value.minutes).padStart(2,'0')}:00`
  const payload = {
    startLocation: form.value.startLocation,
    endLocation: form.value.endLocation,
    distanceKm: form.value.distanceKm,
    estimatedTime: time
  }

  try {
    if (editingRoute.value) {
      await api.put(`/routes/${form.value.routeId}`, payload)
      success.value = 'Cập nhật tuyến thành công!'
    } else {
      await api.post('/routes', payload)
      success.value = 'Thêm tuyến thành công!'
    }
    await loadRoutes()
    resetForm()
  } catch (err) {
    error.value = err.response?.data?.message || 'Lỗi khi lưu tuyến'
  }
}

const editRoute = (route) => {
  editingRoute.value = route
  const [h, m] = route.estimatedTime.split(':')
  form.value = { ...route, hours: +h, minutes: +m }
  window.scrollTo(0, 0)
}

const cancelEdit = () => { editingRoute.value = null; resetForm() }
const confirmDelete = (r) => { routeToDelete.value = r; showDeleteModal.value = true }

const deleteRoute = async () => {
  try {
    await api.delete(`/routes/${routeToDelete.value.routeId}`)
    success.value = 'Xóa tuyến thành công!'
    await loadRoutes()
  } catch (err) {
    error.value = 'Xóa thất bại'
  } finally {
    showDeleteModal.value = false
  }
}

const resetForm = () => {
  form.value = { routeId: null, startLocation: '', endLocation: '', distanceKm: 0, hours: 0, minutes: 0 }
  editingRoute.value = null
}

const formatTime = (t) => {
  const [h, m] = t.split(':')
  return `${h}h${m !== '00' ? m + 'p' : ''}`
}
</script>

<style scoped>
@import '@/assets/css/admin.css';
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>