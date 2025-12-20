<template>
  <div class="max-w-xl mx-auto">
    <form class="space-y-6" @submit.prevent="updateLogin">
      <UFormGroup label="New Username" name="username" required>
        <UInput id="username" v-model="newUsername" type="text" required />
      </UFormGroup>
      <UFormGroup label="New Password" name="password" required>
        <UInput id="password" v-model="newPassword" type="password" required />
      </UFormGroup>
      <div>
        <UButton type="submit" color="primary">Update Settings</UButton>
      </div>
    </form>

    <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <UButton
        color="red"
        variant="outline"
        icon="i-heroicons-arrow-left-on-rectangle-20-solid"
        block
        @click="logout"
      >
        Logout
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { signOut } = useAuth();
const newUsername = ref('');
const newPassword = ref('');
const toast = useToast();

async function logout() {
  await signOut({ callbackUrl: '/login' });
}

async function updateLogin() {
  try {
    const response = await $fetch('/api/users/auth/updateLogin', {
      method: 'POST',
      body: {
        newUsername: newUsername.value,
        newPassword: newPassword.value,
      },
    });

    if (response.success) {
      toast.add({
        title: 'Success',
        description: 'Settings updated successfully',
        color: 'green'
      });
      newUsername.value = '';
      newPassword.value = '';
    } else {
      throw new Error(response.message || 'Failed to update settings');
    }
  } catch (error: any) {
    console.error('Error updating settings:', error);
    toast.add({
      title: 'Error',
      description: error.message || 'An error occurred while updating settings',
      color: 'red'
    });
  }
}
</script>
