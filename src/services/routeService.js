// src/services/routeService.js
import api from './api';

const ROUTE_URL = '/routes'; // Khớp với @RequestMapping("/api/routes")

export const routeService = {
  // READ: Lấy danh sách Tuyến xe
  getAllRoutes: async () => {
    try {
      const response = await api.get(ROUTE_URL);
      // Giả sử API trả về ApiResponse<List<RouteDTO>>
      return response.data.data; 
    } catch (error) {
      console.error('Lỗi khi tải danh sách tuyến xe:', error);
      throw error;
    }
  },

  // CREATE: Thêm Tuyến xe mới
  createRoute: async (routeData) => {
    // routeData: { departure, destination, distance_km }
    const response = await api.post(ROUTE_URL, routeData);
    return response.data; 
  },

  // UPDATE: Cập nhật Tuyến xe
  updateRoute: async (routeId, routeData) => {
    const response = await api.put(`${ROUTE_URL}/${routeId}`, routeData);
    return response.data; 
  },

  // DELETE: Xóa Tuyến xe
  deleteRoute: async (routeId) => {
    const response = await api.delete(`${ROUTE_URL}/${routeId}`);
    return response.data; 
  },

  exportRoutes: async () => {
        const response = await api.get('/export/routes', { responseType: 'arraybuffer' });
        return response.data;
    }
};