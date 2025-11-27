// src/services/busService.js (ĐÃ CẬP NHẬT)
import api from './api';

// ĐƯỜNG DẪN MỚI: Chỉ còn '/buses' để khớp với @RequestMapping("/api/buses") trong BusController
const BUS_URL = '/buses'; 

export const busService = {
  // READ: Lấy danh sách Xe buýt
  getAllBuses: async () => {
    try {
      // Gọi API: http://localhost:7000/api/buses
      const response = await api.get(BUS_URL);
      
      // *** QUAN TRỌNG: Backend của bạn trả về ApiResponse, nên dữ liệu thực tế
      // nằm trong một trường data. Bạn cần kiểm tra xem trường đó tên là gì
      // (ví dụ: 'data', 'result' hay 'payload')
      // TẠM THỜI GIẢ ĐỊNH DỮ LIỆU NẰM TRONG TRƯỜNG 'data'
      return response.data.data; 
    } catch (error) {
      console.error('Lỗi khi tải danh sách xe buýt:', error);
      throw error;
    }
  },

  // CREATE: Thêm Xe buýt mới
  createBus: async (busData) => {
    const response = await api.post(BUS_URL, busData);
    return response.data; 
  },

  // UPDATE: Cập nhật Xe buýt
  updateBus: async (busId, busData) => {
    const response = await api.put(`${BUS_URL}/${busId}`, busData);
    return response.data; 
  },

  // DELETE: Xóa Xe buýt
  deleteBus: async (busId) => {
    const response = await api.delete(`${BUS_URL}/${busId}`);
    return response.data; 
  },

   exportBuses: async () => {
        const response = await api.get('/export/buses', { responseType: 'arraybuffer' });
        return response.data;
    }
};