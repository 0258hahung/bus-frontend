<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ userData.user_id ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới' }}</h3>
        <button @click="emit('close')" class="close-btn">&times;</button>
      </div>
      
      <form @submit.prevent="saveUser">
        <div class="form-group">
          <label for="full_name">Tên đầy đủ:</label>
          <input id="full_name" v-model="userData.full_name" type="text" required/>
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" v-model="userData.email" type="email" required/>
        </div>

        <div class="form-group">
          <label for="phone">Điện thoại:</label>
          <input id="phone" v-model="userData.phone" type="text"/>
        </div>

        <div class="form-group" v-if="!userData.user_id">
          <label for="password">Mật khẩu (Bắt buộc khi tạo mới):</label>
          <input id="password" v-model="userData.password" type="password" :required="!userData.user_id"/>
        </div>

        <div class="form-group">
          <label for="role">Vai trò:</label>
          <select id="role" v-model="userData.role" required>
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        
        <div class="modal-footer">
          <button type="button" @click="emit('close')" class="cancel-btn">Hủy</button>
          <button type="submit" class="save-btn">
            {{ userData.user_id ? 'Cập nhật' : 'Thêm mới' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialUser: {
    type: Object,
    default: () => ({ user_id: null, full_name: '', email: '', phone: '', role: 'CUSTOMER', is_active: true })
  }
})

const emit = defineEmits(['save', 'close'])

const userData = ref({ 
    ...props.initialUser,
    password: '' // Luôn khởi tạo password trống để không hiển thị mật khẩu cũ
})

watch(() => props.initialUser, (newVal) => {
    userData.value = { ...newVal, password: '' }
}, { deep: true })

const saveUser = () => {
  if (!userData.value.full_name || !userData.value.email || (!userData.value.user_id && !userData.value.password)) {
      alert('Vui lòng điền đầy đủ Tên, Email và Mật khẩu (nếu là thêm mới).')
      return
  }
  emit('save', userData.value)
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
    border-color: #10b981; outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 20px;}
.cancel-btn { background-color: #f1f1f1; color: #333; border: 1px solid #ccc; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }

.save-btn {
    background-color: #10b981; /* Màu Xanh ngọc */
    color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; 
}
.save-btn:hover { background-color: #059669; }
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