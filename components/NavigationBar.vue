<template>
    <nav class="navigation-bar">
      <ul>
        <li><router-link to="/dashboard">Dashboard</router-link></li>
        <li><router-link to="/settings">Settings</router-link></li>
        <li><a href="#" @click.prevent="logout">Logout</a></li>
      </ul>
    </nav>
  </template>

<script setup>
import { useRouter } from 'vue-router';
import useAuth from '@/composables/useAuth';

const router = useRouter();
const { logoutUser } = useAuth();

async function logout() {
await logoutUser();
router.push('/login'); // Redirect to the login page after logging out
}
</script>
  
  <style scoped>
  /* Add your styles here */
  </style>