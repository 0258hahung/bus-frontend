<template>
  <div class="page-wrapper">
    <Navbar />
    
    <main class="auth-main">
      <div class="auth-container">
        <h1 class="auth-title">Đăng ký tài khoản</h1>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">Họ và tên</label>
            <input 
              v-model="form.fullName" 
              type="text" 
              class="form-input"
              placeholder="Nguyễn Văn A"
              required
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input 
              v-model="form.email" 
              type="email" 
              class="form-input"
              placeholder="example@email.com"
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
              minlength="6"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Xác nhận mật khẩu</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              class="form-input"
              placeholder="••••••••"
              required
              autocomplete="new-password"
            />
          </div>

          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div v-if="success" class="alert alert-success">
            {{ success }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Đã có tài khoản? 
            <router-link to="/login" class="auth-link">
              Đăng nhập
            </router-link>
          </p>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import api from '@/services/api'

const router = useRouter()

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = ''

  // Validation
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  loading.value = true

  try {
    const { confirmPassword, ...registerData } = form.value
    await api.post('/auth/register', registerData)
    
    success.value = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...'
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (err) {
    console.error('Register error:', err)
    error.value = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!'
  } finally {
    loading.value = false
  }
}
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

.auth-container {
  background: white;
  border-radius: 12px;
  padding: 48px;
  max-width: 520px;
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

.auth-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--gray-900);
  font-size: 15px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(243, 107, 33, 0.1);
}

.auth-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--gray-200);
  color: var(--gray-600);
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

@media (max-width: 640px) {
  .auth-main {
    padding: 40px 16px;
  }

  .auth-container {
    padding: 32px 24px;
  }

  .auth-title {
    font-size: 28px;
  }
}
</style>