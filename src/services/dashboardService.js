// src/services/dashboardService.js
import api from "./api";

export function getRevenue(start, end) {
  return api.get("/dashboard/revenue", {
    params: { start, end }
  });
}

// 📌 1. Lấy số vé theo tuyến (biểu đồ cột)
export function getTicketsByRoute() {
  return api.get("/dashboard/tickets-by-route");
}

// 📌 2. Lấy số user mới theo tháng
export function getNewUsersMonthly() {
  return api.get("/dashboard/new-users-monthly");
}
