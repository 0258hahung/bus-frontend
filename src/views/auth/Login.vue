<template>
  <div class="page-wrapper">
    <Navbar />

    <main class="auth-main">
      <div class="auth-container">
        <h1 class="auth-title">Đăng nhập</h1>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="admin@futa.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Mật khẩu</label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Chưa có tài khoản?
            <router-link to="/register" class="auth-link">Đăng ký</router-link>
          </p>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await api.post('/auth/login', form.value)
    const { token } = res.data.data

    // Giải mã JWT để lấy thông tin user
    let payload
    try {
      payload = JSON.parse(atob(token.split('.')[1]))
    } catch (e) {
      console.warn('Không parse được JWT payload, dùng email mặc định')
      payload = { sub: form.value.email }
    }

    const user = {
      userId: payload.userId || payload.id,
      email: payload.sub || form.value.email,
      role: payload.role || 'CUSTOMER' // backend phải trả về role: "ADMIN" hoặc "CUSTOMER"
    }

    // Lưu vào Pinia + localStorage
    authStore.setAuth(token, user)

    // Redirect đúng role
    const redirectPath = route.query.redirect || '/'

    if (authStore.isAdmin) {
      // Admin: luôn vào /admin (có sidebar)
      router.push('/admin')
    } else {
      // Customer: không được vào /admin
      const safePath = redirectPath.startsWith('/admin') ? '/' : redirectPath
      router.push(safePath)
    }

  } catch (err) {
    console.error('Login error:', err)
    error.value = err.response?.data?.message || 'Email hoặc mật khẩu không đúng!'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Giữ nguyên style đẹp như cũ */
.auth-main {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--gray-50);
}

.auth-container {
  background: white;
  border-radius: 12px;
  padding: 48px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.auth-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 32px;
}

.btn-primary {
  background: #e86c1c;
  color: white;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
}

.alert-error {
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
}

@media (max-width: 640px) {
  .auth-container { padding: 32px 24px; }
  .auth-title { font-size: 28px; }
}

.auth-link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: underline;
  transition: all 0.3s ease;
}

.auth-link:hover {
  color: var(--primary-dark);
}
</style>