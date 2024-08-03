// views/auth/Login.vue
<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleSubmit">
      <label for="email">Email:</label>
      <input type="email" id="email" v-model="email" required />

      <label for="password">Password:</label>
      <input type="password" id="password" v-model="password" required />

      <button type="submit">Login</button>
    </form>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Database } from 'duckdb-async'; // Import the DuckDB library for data storage

interface User {
  email: string;
  password: string;
}

export default defineComponent({
  name: 'Login',
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const error = ref<string | null>(null);

    async function handleSubmit() {
      try {
        // Connect to the DuckDB database
        const db = await Database.create('users.db');

        // Check if a user with provided email and password exists in the database
        const result = await db.all(
          `SELECT * FROM users WHERE email = $1 AND password = $2`,
          [email.value, password.value]
        ) as User[];

        if (result.length > 0) {
          // Redirect to the dashboard or desired page after successful login
          router.push('/dashboard');
        } else {
          error.value = 'Invalid email or password';
        }
      } catch (error: any) {
        console.error(error);
        error.value = 'An error occurred during login';
      }
    }

    return {
      email,
      password,
      error,
      handleSubmit,
    };
  },
});
</script>

<style scoped>
/* Add your custom styles here */
</style>