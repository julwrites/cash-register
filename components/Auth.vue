<template>
    <div class="auth">
      <!-- Login Form -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <h2>Login</h2>
        <input type="email" placeholder="Email" required v-model="loginForm.email" />
        <input type="password" placeholder="Password" required v-model="loginForm.password" />
        <button type="submit">Log In</button>
      </form>
  
      <!-- Registration Form -->
      <form v-else @submit.prevent="handleRegistration" class="auth-form">
        <h2>Register</h2>
        <input type="text" placeholder="Username" required v-model="registrationForm.username" />
        <input type="email" placeholder="Email" required v-model="registrationForm.email" />
        <input type="password" placeholder="Password" required v-model="registrationForm.password" />
        <button type="submit">Register</button>
      </form>
  
      <!-- Toggle between Login and Registration -->
      <p class="toggle-auth-mode"><a href="#" @click.prevent="toggleMode">{{ toggleText }}</a></p>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import useAuth from '@/composables/useAuth';
  import { useRouter } from 'vue-router';
  
  const mode = ref('login'); // Default to login mode
  const loginForm = ref({ email: '', password: '' });
  const registrationForm = ref({ username: '', email: '', password: '' });
  const router = useRouter();
  const { login, register } = useAuth();
  
  async function handleLogin() {
    try {
      await login(loginForm.value);
      router.push('/dashboard'); // Redirect to the dashboard after successful login
    } catch (error) {
      console.error('Login Error:', error);
      // Display an error message or perform other actions as needed for failed login attempts
    }
  }
  
  async function handleRegistration() {
    try {
      await register(registrationForm.value);
      router.push('/dashboard'); // Redirect to the dashboard after successful registration
    } catch (error) {
      console.error('Registration Error:', error);
      // Display an error message or perform other actions as needed for failed registration attempts
    }
  }
  
  function toggleMode() {
    mode.value = mode.value === 'login' ? 'register' : 'login';
  }
  
  const toggleText = computed(() => (mode.value === 'login' ? "Don't have an account? Register" : 'Already have an account? Log In'));
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>