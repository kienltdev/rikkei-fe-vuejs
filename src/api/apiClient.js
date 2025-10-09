// src/api/apiClient.js
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/warehouse',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'vi'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const credentials = authStore.credentials;

    if (credentials) {
      const { username, password } = credentials;
      const base64Credentials = btoa(`${username}:${password}`);
      config.headers.Authorization = `Basic ${base64Credentials}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
