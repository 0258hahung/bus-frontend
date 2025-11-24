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

          <!-- Nút Google Login -->
          <div id="g_id_onload"></div>
          <div id="g_id_signin" class="mt-3"></div>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

// Email/Password login
const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await api.post('/auth/login', form.value)
    const { token } = res.data.data

    let payload
    try { payload = JSON.parse(atob(token.split('.')[1])) } 
    catch { payload = { sub: form.value.email } }

    const user = {
      userId: payload.userId || payload.id,
      email: payload.sub || form.value.email,
      role: payload.role || 'CUSTOMER'
    }

    authStore.setAuth(token, user)

    const redirectPath = route.query.redirect || '/'
    router.push(authStore.isAdmin ? '/admin' : redirectPath.startsWith('/admin') ? '/' : redirectPath)
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.response?.data?.message || 'Email hoặc mật khẩu không đúng!'
  } finally {
    loading.value = false
  }
}

// Google One Tap / FedCM login
const handleGoogleCallback = async (response) => {
  console.log('Google callback response:', response)

  if (!response || !response.credential) {
    console.error('No credential returned from Google', response)
    error.value = 'Google login thất bại!'
    return
  }

  const idToken = response.credential
  console.log('Received Google ID token:', idToken)

  try {
    const res = await api.post('/auth/google', { idToken })
    const { userId, fullName, email, role, token } = res.data.data
    authStore.setAuth(token, { userId, fullName, email, role })

    const redirectPath = route.query.redirect || '/'
    router.push(authStore.isAdmin ? '/admin' : redirectPath.startsWith('/admin') ? '/' : redirectPath)
  } catch (err) {
    console.error('Google login error:', err)
    error.value = err.response?.data?.message || 'Đăng nhập Google thất bại!'
  }
}

// Initialize Google login
onMounted(() => {
  if (!window.google) {
    error.value = 'Google API chưa load'
    return
  }

  window.google.accounts.id.initialize({
    client_id: '80909778177-4et1b4534kdbaf36h4unlevtl7aidmd0.apps.googleusercontent.com', // client_id thật
    callback: handleGoogleCallback,
    ux_mode: 'popup'
  })

  window.google.accounts.id.renderButton(
    document.getElementById('g_id_signin'),
    { theme: 'outline', size: 'large', width: '100%' }
  )

  window.google.accounts.id.prompt((notification) => {
    console.log('Google prompt notification:', notification)
  })
})
</script>


<style scoped>
.auth-main {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--gray-50);
}
.auth-container { background: white; border-radius: 12px; padding: 48px; max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
.auth-title { font-size: 32px; font-weight: 800; color: var(--primary-color); text-align: center; margin-bottom: 32px; }
.btn-primary { background: #e86c1c; color: white; padding: 14px; border-radius: 8px; font-weight: 600; font-size: 16px; }
.alert-error { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 14px; }
.auth-link { color: var(--primary-color); font-weight: 600; text-decoration: underline; }
</style>
