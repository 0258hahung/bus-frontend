<template>
  <div class="user-management-view admin-content-area">
    <div class="header-actions">
      <h2>Danh sách Người dùng</h2>
      <button @click="openCreateModal" class="add-user-btn">
        <span class="btn-icon">➕</span>
        Thêm Người dùng
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đầy đủ</th>
            <th>Email</th>
            <th>Điện thoại</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.user_id">
            <td>{{ user.user_id }}</td>
            <td>{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td><span :class="['role-badge', user.role ? user.role.toLowerCase() : '']">{{ user.role }}</span></td>
            <td><span :class="['status-badge', user.is_active ? 'active' : 'inactive']">{{ user.is_active ? 'Hoạt động' : 'Khóa' }}</span></td>
            <td>
              <button @click="editUser(user)" class="action-btn edit-btn">Sửa</button>
              <button @click="toggleStatus(user)" :class="['action-btn', user.is_active ? 'delete-btn' : 'restore-btn']">
                {{ user.is_active ? 'Khóa' : 'Mở khóa' }}
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
              <td colspan="7" class="no-data">
                {{ isLoading ? 'Đang tải dữ liệu...' : 'Không có người dùng nào được tìm thấy.' }}
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UserFormModal
      v-if="isModalOpen"
      :initialUser="currentUser"
      @save="handleSaveUser"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserFormModal from '@/components/admin/UserFormModal.vue'
import { userService } from '@/services/userService' // Import User Service

const users = ref([])
const isModalOpen = ref(false)
const currentUser = ref({})
const isLoading = ref(false)

// --- Logic Modal ---
const openCreateModal = () => {
    // Luôn đặt password trống khi tạo mới
    currentUser.value = { user_id: null, full_name: '', email: '', phone: '', password: '', role: 'CUSTOMER', is_active: true }
    isModalOpen.value = true
}

const editUser = (userData) => {
    // Không bao gồm mật khẩu khi chỉnh sửa
    const { password, ...rest } = userData
    // Đảm bảo các trường snake_case (Vue) khớp với camelCase (DB)
    currentUser.value = { 
        ...rest,
        user_id: userData.userId || userData.user_id,
        full_name: userData.fullName || userData.full_name,
        is_active: userData.isActive || userData.is_active
    } 
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

// --- Logic Tải Dữ liệu (CRUD - Read) ---
const fetchUsers = async () => {
    isLoading.value = true;
    try {
        const rawData = await userService.getAllUsers(); 
        
        // Ánh xạ dữ liệu từ camelCase (DB) sang snake_case (Vue Template)
        users.value = rawData.map(u => ({
            user_id: u.userId,
            full_name: u.fullName,
            email: u.email,
            phone: u.phone,
            role: u.role,
            is_active: u.isActive, // Sửa thành isActive nếu Backend dùng camelCase
        }));
        
    } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
        alert('Lỗi: Không thể tải dữ liệu người dùng.');
    } finally {
        isLoading.value = false;
    }
}

// --- Logic CRUD thực tế (Create/Update) ---
const handleSaveUser = async (data) => {
    // 3. Tạo đối tượng dữ liệu gửi lên API (Dùng tên trường DTO của Spring Boot)
    const apiData = {
        fullName: data.full_name, // Chuyển từ full_name sang fullName (giả định DTO dùng camelCase)
        email: data.email,
        phone: data.phone,
        role: data.role,
        isActive: data.is_active,
    };
    
    try {
        if (data.user_id) {
            // Update
            await userService.updateUser(data.user_id, apiData);
            alert(`Cập nhật thành công người dùng ID ${data.user_id}!`);
        } else {
            // Create (Cần gửi mật khẩu khi tạo mới)
            apiData.password = data.password;
            await userService.createUser(apiData);
            alert(`Thêm mới thành công người dùng ${data.full_name}!`);
        }
        
        closeModal();
        await fetchUsers(); // Tải lại dữ liệu sau khi lưu
        
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lưu người dùng thất bại.';
        alert(`Lỗi: ${errorMessage}`);
    }
}

// --- Logic Khóa/Mở khóa (Update Status) ---
const toggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const action = newStatus ? 'mở khóa' : 'khóa';

    if (confirm(`Bạn có chắc chắn muốn ${action} người dùng ${user.full_name}?`)) {
        try {
            // Gọi API cập nhật trạng thái isActive
            await userService.toggleUserStatus(user.user_id, newStatus);
            alert(`${user.full_name} đã được ${action} thành công!`);
            await fetchUsers(); // Tải lại dữ liệu
        } catch (error) {
            const errorMessage = error.response?.data?.message || `Thao tác ${action} thất bại.`;
            alert(`Lỗi: ${errorMessage}`);
        }
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
/* Dùng lại styles chung cho admin */
.admin-content-area {
    padding: 32px;
}
/* ... header-actions, table-container, data-table styles ... */
.add-user-btn {
    background-color: #10b981; /* Màu Xanh ngọc */
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
.add-user-btn:hover { background-color: #059669; }

/* Role Badges */
.role-badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
}
.role-badge.admin {
    background-color: #fce7f3;
    color: #db2777;
    border: 1px solid #db2777;
}
.role-badge.customer {
    background-color: #eff6ff;
    color: #2563eb;
}

/* User Status Badges */
.status-badge.active {
    background-color: #d1fae5;
    color: #059669;
}
.status-badge.inactive {
    background-color: #fee2e2;
    color: #dc2626;
}

.edit-btn { background-color: #2563eb; color: white; }
.delete-btn { background-color: #dc2626; color: white; }
.restore-btn { background-color: #059669; color: white; }
.action-btn { padding: 6px 10px; margin-right: 8px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
</style>