import { defineStore } from 'pinia';
import axios, { AxiosResponse } from 'axios';

interface User {
  // Define the shape of your user object here
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      try {
        const response: AxiosResponse<{ token: string }> = await axios.post('/api/login', { email, password });
        this.token = response.data.token;
        // Fetch user data after successful login (if not already fetched)
        if (!this.user) {
          await this.fetchUserData();
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Invalid email or password');
      }
    },
    async register(username: string, email: string, password: string) {
      try {
        const response: AxiosResponse<{ token: string }> = await axios.post('/api/register', { username, email, password });
        // Assuming registration automatically logs in the user and returns a token
        this.token = response.data.token;
        // Fetch user data after successful registration (if not already fetched)
        if (!this.user) {
          await this.fetchUserData();
        }
      } catch (error) {
        console.error('Registration failed:', error);
        throw new Error('Email or username is already taken');
      }
    },
    async logout() {
      try {
        // Send a request to the server to invalidate the token (optional, depending on your app's requirements)
        await axios.post('/api/logout', null, { headers: { Authorization: `Bearer ${this.token}` } });
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        this.token = null;
        this.user = null;
      }
    },
    async fetchUserData() {
      try {
        const response: AxiosResponse<User> = await axios.get('/api/user', { headers: { Authorization: `Bearer ${this.token}` } });
        this.user = response.data;
      } catch (error) {
        console.error('Fetch user data failed:', error);
        throw new Error('Failed to fetch user data');
      }
    },
  },
});
