// src/services/ticketService.js
import api from './api';

const TICKET_URL = '/tickets'; // Khớp với @RequestMapping("/api/tickets")

export const ticketService = {
  // READ: Lấy danh sách Vé đã đặt
  getAllTickets: async () => {
    try {
      const response = await api.get(TICKET_URL);
      // Giả sử API trả về ApiResponse<List<TicketDTO>>
      return response.data.data; 
    } catch (error) {
      console.error('Lỗi khi tải danh sách vé:', error);
      throw error;
    }
  },

  // UPDATE: Cập nhật trạng thái Vé (Ví dụ: Chuyển từ PENDING sang CANCELLED)
  updateTicketStatus: async (ticketId, status) => {
    // status: 'PAID', 'CANCELLED'
    const response = await api.patch(`${TICKET_URL}/${ticketId}/status`, { status });
    return response.data; 
  },

  // GET: Lấy chi tiết một vé
  getTicketById: async (ticketId) => {
    const response = await api.get(`${TICKET_URL}/${ticketId}`);
    return response.data.data; 
  },
};