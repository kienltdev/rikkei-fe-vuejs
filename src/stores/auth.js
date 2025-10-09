import { defineStore } from 'pinia';
import api from '@/api/auth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    credentials: JSON.parse(localStorage.getItem('credentials')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.credentials && !!state.user,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.login(username, password);
        this.user = response.data;

        const creds = { username, password };
        this.credentials = creds;

        localStorage.setItem('credentials', JSON.stringify(creds));

        return response.data;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.credentials = null;
      localStorage.removeItem('credentials');
    },

    async register(userData) {
      return api.register(userData);
    },

    async fetchProfile() {
      if (!this.credentials) return;
      try {
        const response = await api.getProfile(this.credentials);
        this.user = response.data;
      } catch (error) {
        this.logout();
        console.error('Failed to fetch profile:', error);
      }
    },

    async updateProfile(profileData) {
      if (!this.credentials) throw new Error("User not authenticated");
      const response = await api.updateProfile(this.credentials, profileData);
      this.user = response.data;
      return response.data;
    },

    async tryAutoLogin() {
      if (this.credentials) {
        await this.fetchProfile();
      }
    }
  },
});
