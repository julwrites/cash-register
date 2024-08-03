<template>
    <div class="register-container">
      <h1>Register</h1>
      <form @submit.prevent="handleSubmit">
        <input type="text" v-model="email" placeholder="Email" />
        <input type="password" v-model="password" placeholder="Password" />
        <input type="password" v-model="confirmPassword" placeholder="Confirm Password" />
        <button type="submit">Register</button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { User } from '@/composables/useAuth'
  import { Database } from 'duckdb-async'; // Import the DuckDB library for data storage
  
  export default defineComponent({
    name: 'Register',
    setup() {
      const email = ref('');
      const password = ref('');
      const confirmPassword = ref('');
      const errorMessage = ref('');
  
      async function handleSubmit(): Promise<void> {
        // Reset the error message before each submission
        errorMessage.value = '';
  
        if (password.value !== confirmPassword.value) {
          errorMessage.value = 'Passwords do not match';
          return;
        }
  
        try {
          // Open a connection to the DuckDB database
          const db = await Database.create('users.db');
  
          // Check if the email is already registered in the users table
          const existingUsers = await db.all(
            `SELECT * FROM users WHERE email = $1`,
            [email.value]
          ) as User[];
  
          if (existingUsers.length > 0) {
            errorMessage.value = 'Email is already taken';
            return;
          }
  
          // Insert the new user into the users table
          await db.run(
            `INSERT INTO users (email, password) VALUES ($1, $2)`,
            [email.value, password.value]
          );
  
          // Registration successful, show a success message or redirect to login page
        } catch (error) {
          console.error('Registration failed:', error);
          errorMessage.value = 'An error occurred during registration';
        }
      }
  
      return {
        email,
        password,
        confirmPassword,
        errorMessage,
        handleSubmit,
      };
    },
  });
  </script>
  
  <style scoped>
  /* Add your component-specific styles here */
  .register-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .error-message {
    color: red;
  }
  </style>