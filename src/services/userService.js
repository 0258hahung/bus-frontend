// src/services/userService.js
import api from './api';

const USER_URL = '/users'; // Khớp với @RequestMapping("/api/users")

export const userService = {
  // READ: Lấy danh sách Người dùng
  getAllUsers: async () => {
    try {
      const response = await api.get(USER_URL);
      // Giả sử API trả về ApiResponse<List<UserDTO>>
      return response.data.data; 
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
      throw error;
    }
  },

  // CREATE: Thêm Người dùng mới
  createUser: async (userData) => {
    // userData: { full_name, email, phone, password, role }
    const response = await api.post(USER_URL, userData);
    return response.data; 
  },

  // UPDATE: Cập nhật Người dùng (Thông tin cơ bản)
  updateUser: async (userId, userData) => {
    const response = await api.put(`${USER_URL}/${userId}`, userData);
    return response.data; 
  },

  // Cập nhật trạng thái kích hoạt/khóa (is_active)
  toggleUserStatus: async (userId, isActive) => {
    // Giả định backend có endpoint PATCH để toggle status
    const response = await api.patch(`${USER_URL}/${userId}/status`, { is_active: isActive });
    return response.data; 
  },

  exportUsers: async () => {
        const response = await api.get('/export/users', { responseType: 'arraybuffer' });
        return response.data;
    }
};