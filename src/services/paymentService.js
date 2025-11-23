// src/services/paymentService.js
import api from './api';

const PAYMENT_URL = '/payments'; // Khớp với @RequestMapping("/api/payments")

export const paymentService = {
  // READ: Lấy danh sách Giao dịch Thanh toán
  getAllPayments: async () => {
    try {
      const response = await api.get(PAYMENT_URL);
      // Giả sử API trả về ApiResponse<List<PaymentDTO>>
      return response.data.data; 
    } catch (error) {
      console.error('Lỗi khi tải danh sách thanh toán:', error);
      throw error;
    }
  },

  // GET: Lấy chi tiết một thanh toán (thường được gọi cùng với ticket)
  getPaymentByTicketId: async (ticketId) => {
    // Giả định backend có endpoint lấy thanh toán theo ticketId
    const response = await api.get(`${PAYMENT_URL}/ticket/${ticketId}`);
    return response.data.data; 
  },
};