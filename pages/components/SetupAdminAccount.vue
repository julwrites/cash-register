<template>
  <UCard>
    <template #header>
      <h2 class="text-xl font-bold text-center">Set Up Admin Account</h2>
    </template>
    <form class="flex flex-col gap-4" @submit.prevent="setupAccount">
      <UFormGroup label="Username" name="username" required>
        <UInput
          id="username"
          v-model="username"
          type="text"
          required
        />
      </UFormGroup>
      <UFormGroup label="Password" name="password" required>
        <UInput
          id="password"
          v-model="password"
          type="password"
          required
        />
      </UFormGroup>
      <UFormGroup label="Confirm Password" name="confirmPassword" required>
        <UInput
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
        />
      </UFormGroup>
      <UButton type="submit" color="primary" block class="mt-4">
        Create Admin Account
      </UButton>
    </form>
  </UCard>
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
