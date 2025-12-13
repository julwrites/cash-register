<template>
  <div class="setup-admin-modal">
    <h2 class="text-center mb-lg">Set Up Admin Account</h2>
    <form class="setup-admin-form" @submit.prevent="setupAccount">
      <div class="form-group">
        <label for="username" class="form-label">Username:</label>
        <UInput
          id="username"
          v-model="username"
          type="text"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="password" class="form-label">Password:</label>
        <UInput
          id="password"
          v-model="password"
          type="password"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword" class="form-label"
          >Confirm Password:</label
        >
        <UInput
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          class="form-input"
          required
        />
      </div>
      <UButton
        type="submit"
        color="primary"
        block
        class="btn btn-primary setup-admin-button"
      >
        Create Admin Account
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['accountSetup']);

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const toast = useToast();

async function setupAccount() {
  if (password.value !== confirmPassword.value) {
    toast.add({
      title: 'Error',
      description: 'Passwords do not match',
      color: 'red',
    });
    return;
  }

  try {
    const response = await $fetch('/api/users/auth/setupAdmin', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    });

    if (response.success) {
      emit('accountSetup');
    } else {
      throw new Error('Failed to set up admin account');
    }
  } catch (error) {
    console.error('Setup admin account error:', error);
    toast.add({
      title: 'Error',
      description: 'An error occurred while setting up the admin account',
      color: 'red',
    });
  }
}
</script>

<style scoped>
.setup-admin-modal {
  padding: var(--spacing-md);
}

.setup-admin-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.setup-admin-button {
  margin-top: var(--spacing-md);
}
</style>
