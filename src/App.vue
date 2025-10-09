<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AuthLayout from './layouts/AuthLayout.vue';
import DefaultLayout from './layouts/DefaultLayout.vue';

const route = useRoute();

const layoutComponent = computed(() => {
  switch (route.meta.layout) {
    case 'AuthLayout':
      return AuthLayout;
    case 'DefaultLayout':
      return DefaultLayout;
    default:
      return DefaultLayout;
  }
});
</script>

<template>
  <component :is="layoutComponent">
    <RouterView />
  </component>
</template>

<style>
/* Thêm CSS global ở đây hoặc trong file assets/main.css */
body {
  margin: 0;
  font-family: sans-serif;
}
</style>
