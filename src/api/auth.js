// src/api/auth.js
import apiClient from './apiClient'; // <-- Thay đổi ở đây

// Hàm login là trường hợp đặc biệt vì nó chưa có credentials trong store
// nên chúng ta vẫn cần tạo header riêng cho nó.
const createAuthHeader = (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  return { Authorization: `Basic ${credentials}` };
};

export default {
  register(userData) {
    // Dùng apiClient không cần header vì đây là public API
    return apiClient.post('/auth/register', userData);
  },

  login(username, password) {
    // Vẫn cần header riêng vì interceptor chưa có credentials lúc này
    return apiClient.get('/auth/me', {
      headers: createAuthHeader(username, password)
    });
  },

  // Các hàm sau sẽ tự động có header nhờ interceptor!
  getProfile() {
    return apiClient.get('/auth/profile');
  },

  updateProfile(profileData) {
    return apiClient.put('/auth/profile', profileData);
  }
};
