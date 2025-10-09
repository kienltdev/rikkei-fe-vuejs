<script setup>
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});

const emit = defineEmits(['update:currentPage']);

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page);
  }
};
</script>

<template>
  <div class="pagination-container" v-if="totalPages > 1">
    <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
      Trước
    </button>
    <span>Trang {{ currentPage }} / {{ totalPages }}</span>
    <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
      Sau
    </button>
  </div>
</template>

<style scoped>
.pagination-container { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.5; }
</style>
