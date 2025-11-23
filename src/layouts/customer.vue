<!-- src/layouts/customer.vue - FIXED -->
<template>
  <div class="customer-app">
    <!-- Navbar chỉ hiện cho user thường -->
    <Navbar v-if="!authStore.isAdmin" />

    <!-- Nội dung chính - QUAN TRỌNG: phải có router-view -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer cố định ở đáy -->
    <Footer v-if="!authStore.isAdmin" class="footer-fixed" />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/AuthStore'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const authStore = useAuthStore()

// Debug: Log khi layout được mount
console.log('Customer Layout Mounted')
console.log('Is Admin:', authStore.isAdmin)
</script>

<style scoped>
.customer-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.main-content {
  flex: 1 0 auto;
  width: 100%;
  position: relative;
}

.footer-fixed {
  flex-shrink: 0;
  margin-top: auto;
  width: 100%;
}

/* Fade transition */
.fade-enter-active {
  transition: opacity 0.2s ease-out;
}

.fade-leave-active {
  transition: opacity 0.15s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>