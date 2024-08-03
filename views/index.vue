<template>
  <div class="home">
    <h1>Welcome to My App</h1>
    <p>This is a simple and modern Vue3 app.</p>

    <!-- Display different content based on user authentication status -->
    <template v-if="isAuthenticated">
      <p>You are currently logged in as {{ username }}</p>
      <router-link to="/dashboard">Go to Dashboard</router-link>
    </template>
    <template v-else>
      <p>Please log in or register to access the app's features.</p>
      <router-link to="/auth">Log In / Register</router-link>
    </template>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'; // Import the authentication store
import { computed } from 'vue';

const authStore = useAuthStore(); // Get access to the authentication store

// Compute properties for user authentication status and username
const isAuthenticated = computed(() => authStore.isAuthenticated);
const username = computed(() => authStore.user?.username || 'Guest');
</script>

<style scoped>
/* Add your styles here */
</style>