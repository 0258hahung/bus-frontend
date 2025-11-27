<template>
  <div class="admin-content">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Tổng chuyến xe</h3>
          <p>{{ stats.totalTrips }}</p>
        </div>
        <div class="stat-card">
          <h3>Tổng vé đã bán</h3>
          <p>{{ stats.totalTickets }}</p>
        </div>
        <div class="stat-card">
          <h3>Tổng doanh thu</h3>
          <p>{{ formatMoney(stats.totalRevenue) }}</p>
        </div>
        <div class="stat-card">
          <h3>Tổng người dùng</h3>
          <p>{{ stats.totalUsers }}</p>
        </div>
      </div>

      <!-- Người dùng mới theo tháng -->
      <div class="user-grid">
        <div class="stat-card" v-for="u in userStats" :key="u.month">
          <h3>Người dùng mới trong {{ u.month }}</h3>
          <p>{{ u.newUsers }}</p>
        </div>
      </div>



      <!-- Biểu đồ doanh thu -->
      <div class="card">
        <h2>📈 Biểu đồ doanh thu theo ngày</h2>
        <div class="filter-row">
          <input type="date" v-model="startDate" />
          <input type="date" v-model="endDate" />
          <button class="filter-btn" @click="loadRevenueChart">Xem biểu đồ</button>
        </div>
        <canvas ref="revenueChart" height="150"></canvas>
      </div>

      <!-- Biểu đồ số vé bán theo tuyến -->
      <div class="card">
        <h2>🚌 Số vé bán theo tuyến</h2>
        <div class="filter-row">
          <label>Hiển thị tối đa:</label>
          <input type="number" v-model.number="maxRoutes" min="1" style="width:80px" />
          <button class="filter-btn" @click="loadRouteChart">Cập nhật</button>
        </div>
        <canvas ref="routeChartRef" height="150"></canvas>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { getRevenue, getTicketsByRoute, getNewUsersMonthly } from "@/services/dashboardService";
import api from "@/services/api";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Title
} from "chart.js";

Chart.register(LineController, LineElement, PointElement, BarController, BarElement, LinearScale, CategoryScale, Title);

const loading = ref(true);
const stats = ref({ totalTrips:0, totalTickets:0, totalRevenue:0, totalUsers:0 });
const startDate = ref("");
const endDate = ref("");

const revenueChartRef = ref(null);
const routeChartRef = ref(null);

let revenueChartInstance = null;
let routeChartInstance = null;

const maxRoutes = ref(5); // số tuyến tối đa hiển thị
const userStats = ref([]);

// ================= Load dashboard stats =================
const loadDashboard = async () => {
  try {
    const res = await api.get("/dashboard");
    stats.value = res.data;
  } catch(e) { console.error("Lỗi tải dashboard:", e); }
};

// ================= Biểu đồ doanh thu =================
const loadRevenueChart = async () => {
  if(!startDate.value || !endDate.value) return;

  try {
    const res = await getRevenue(startDate.value, endDate.value);
    const data = res.data || [];

    const labels = data.map(d => d.date);
    const values = data.map(d => d.revenue);

    if(revenueChartInstance) revenueChartInstance.destroy();

    const ctx = revenueChartRef.value?.getContext("2d");
    if(!ctx) return;

    revenueChartInstance = new Chart(ctx, {
      type: "line",
      data: { labels, datasets:[{ label:"Doanh thu (VND)", data:values, borderColor:"#2563eb", backgroundColor:"rgba(37, 99, 235,0.2)", fill:true, tension:0.3, pointRadius:4 }]},
      options:{ responsive:true, plugins:{title:{display:true,text:"Doanh thu theo ngày",font:{size:16}}}, scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>v.toLocaleString("vi-VN")+"₫"}}} }
    });

  } catch(e){ console.error("Lỗi tải biểu đồ doanh thu:", e); }
};

// ================= Biểu đồ vé theo tuyến =================
const loadRouteChart = async () => {
  try {
    const res = await getTicketsByRoute();
    let data = res.data || [];

    // Sắp xếp giảm dần theo số vé và lấy tối đa maxRoutes
    data.sort((a,b)=>b.tickets - a.tickets);
    data = data.slice(0, maxRoutes.value);

    const labels = data.map(r=>r.route);
    const values = data.map(r=>r.tickets);

    if(routeChartInstance) routeChartInstance.destroy();

    const ctx = routeChartRef.value?.getContext("2d");
    if(!ctx) return;

    routeChartInstance = new Chart(ctx, {
      type:"bar",
      data:{ labels, datasets:[{ label:"Số vé bán", data:values, backgroundColor:"#10b981" }] },
      options:{ responsive:true, plugins:{title:{display:true,text:"Số vé bán theo tuyến",font:{size:16}}}, scales:{y:{beginAtZero:true}} }
    });

  } catch(e){ console.error("Lỗi tải biểu đồ vé theo tuyến:", e);}
};

// ================= Người dùng mới theo tháng =================
const loadUserStats = async () => {
  try{
    const res = await getNewUsersMonthly();
    userStats.value = res.data || [];
  }catch(e){ console.error("Lỗi tải user stats:", e);}
};

// ================= onMounted =================
onMounted(async ()=>{
  await loadDashboard();
  await nextTick();
  await loadRevenueChart();
  await loadRouteChart();
  await loadUserStats();
  loading.value = false;
});

// ================= format tiền =================
const formatMoney = n => n?.toLocaleString("vi-VN",{style:"currency",currency:"VND"});
</script>



<style scoped>
.admin-content {
  padding: 20px;
  background: #f0f2f5; /* nền nhạt cho card nổi bật */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}


/* ================== Stats Cards ================== */
.stats-grid {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: nowrap; /* bắt buộc 1 hàng */
  justify-content: space-between; /* trải đều các card */
}

.stat-card {
  flex: 1; /* chia đều chiều rộng */
  min-width: 180px; /* card nhỏ nhất */
  background: #ffffff; 
  padding: 25px 20px;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card h3 {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #111827;
}

.stat-card p {
  font-size: 1.8rem;
  color: #2563eb;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

/* Responsive nhỏ hơn */
@media (max-width: 1024px) {
  .stats-grid {
    flex-wrap: wrap; /* khi nhỏ thì xuống hàng */
  }
}









/* ================== Activity + Chart Card ================== */
.card {
  background: #ffffff;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.12);
}

.card h2 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #111827;
}

/* ================== Date Filter ================== */
.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-row input[type="date"] {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.filter-btn {
  background: #2563eb;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.filter-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
}

/* ================== Spinner ================== */
.spinner {
  width: 36px;
  height: 36px;
  border: 4px solid #ddd;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container {
  text-align: center;
  margin-top: 50px;
}

</style>
