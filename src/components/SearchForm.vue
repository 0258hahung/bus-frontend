<template>
  <div class="search-form-container">
    <h2 class="search-title">TÌM CHUYẾN XE</h2>
    <form @submit.prevent="handleSearch" class="search-form">
      <div class="form-group">
        <label class="form-label">Điểm đi</label>
        <input 
          v-model="form.from" 
          type="text"
          class="form-input"
          placeholder="TP.HCM, Đà Lạt..."
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">Điểm đến</label>
        <input 
          v-model="form.to" 
          type="text"
          class="form-input"
          placeholder="Nha Trang, Cần Thơ..."
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">Ngày đi</label>
        <input 
          v-model="form.date" 
          type="date"
          class="form-input"
          :min="minDate"
          required
        />
      </div>

      <div class="form-group">
        <label class="form-label">&nbsp;</label>
        <button type="submit" class="btn btn-primary w-full">
          🔍 Tìm chuyến
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['search'])

const form = ref({
  from: '',
  to: '',
  date: new Date().toISOString().split('T')[0]
})

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const handleSearch = () => {
  emit('search', form.value)
}
</script>

<style scoped>
.search-form-container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-title {
  text-align: center;
  color: var(--primary-color);
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
}

.search-form {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  align-items: end;
}

@media (max-width: 1024px) {
  .search-form {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .search-form {
    grid-template-columns: 1fr;
  }
}
</style>