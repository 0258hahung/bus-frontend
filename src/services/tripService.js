import api from './api';

const TRIP_URL = '/trips'; 

export const tripService = {
  // READ: Lấy danh sách Chuyến xe
  getAllTrips: async () => {
    try {
      const response = await api.get(TRIP_URL);
      return response.data.data; 
    } catch (error) {
      console.error('Lỗi khi tải danh sách chuyến xe:', error);
      throw error;
    }
  },

  // CREATE: Thêm Chuyến xe mới
  createTrip: async (tripData) => {
    const response = await api.post(TRIP_URL, tripData);
    return response.data; 
  },

  // UPDATE: Cập nhật Chuyến xe
  updateTrip: async (tripId, tripData) => {
    const response = await api.put(`${TRIP_URL}/${tripId}`, tripData);
    return response.data; 
  },

  // ✅ HỦY CHUYẾN (Sử dụng DELETE /api/trips/{id}/cancel)
  cancelTripById: async (tripId) => {
    // Gọi API DELETE mà bạn đã giữ lại trong Controller
    const response = await api.delete(`${TRIP_URL}/${tripId}/cancel`);
    return response.data; 
  },
  
  exportTrips: async () => {
        const response = await api.get('/export/trips', { responseType: 'arraybuffer' });
        return response.data;
    }
};