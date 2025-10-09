<script setup>
defineProps({
  columns: {
    type: Array,
    required: true, // [{ key: 'id', label: 'ID' }]
  },
  items: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="table-container">
    <table>
      <thead>
      <tr>
        <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="isLoading">
        <td :colspan="columns.length" class="loading-cell">Đang tải dữ liệu...</td>
      </tr>
      <tr v-else-if="items.length === 0">
        <td :colspan="columns.length" class="empty-cell">Không có dữ liệu.</td>
      </tr>
      <tr v-else v-for="item in items" :key="item.id">
        <td v-for="column in columns" :key="column.key">
          <!-- Sử dụng slot để tùy biến hiển thị cho cột cụ thể -->
          <slot :name="`cell(${column.key})`" :item="item">
            {{ item[column.key] }}
          </slot>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Thêm style cho table */
.table-container { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; border: 1px solid #ddd; text-align: left; }
th { background-color: #f4f4f4; }
.loading-cell, .empty-cell { text-align: center; color: #888; padding: 2rem; }
</style>
