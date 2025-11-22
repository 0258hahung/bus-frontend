<template>
  <div id="app">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'

const authStore = useAuthStore()

onMounted(() => {
  authStore.loadUser()
})
</script>

<style>
/* Fast fade transition */
.fade-enter-active {
  transition: opacity 0.15s ease-out;
}

.fade-leave-active {
  transition: opacity 0.1s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Prevent layout shift during transition */
.fade-enter-active,
.fade-leave-active {
  position: relative;
}
</style>