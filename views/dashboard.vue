<template>
    <div class="dashboard">
      <h1>Welcome to Your Dashboard, {{ username }}</h1>
      <p>This is a secure and personalized area of the app.</p>
  
      <!-- Display user's data or any other content here -->
      <div class="user-data">
        <h2>Your Data</h2>
        <!-- Render user's data or components to display their data -->
        <!-- Example: -->
        <p>Email: {{ userData.email }}</p>
        <p>Member since: {{ memberSince }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/auth'; // Import the authentication store
  import { computed, onMounted } from 'vue';
  
  const authStore = useAuthStore(); // Get access to the authentication store
  
  // Compute properties for user data and username
  const userData = computed(() => authStore.user);
  const username = computed(() => authStore.user?.username || 'Guest');
  
  // Format the memberSince date in a readable format
  const memberSince = computed(() => {
    const date = new Date(userData.value?.created_at);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  });
  
  // Fetch user data when the component is mounted (if not already in the store)
  onMounted(() => {
    if (!authStore.user) {
      authStore.fetchUserData(); // Assuming fetchUserData() method exists to get user data from API and store it
    }
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>