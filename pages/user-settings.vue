<template>
  <div class="settings-container">
    <form class="settings-form" @submit.prevent="updateLogin">
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

    <div class="logout-section">
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

<style scoped>
.settings-container {
  max-width: 36rem; /* max-w-xl */
  margin-left: auto;
  margin-right: auto;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* space-y-6 */
}

.logout-section {
  margin-top: 2rem; /* mt-8 */
  padding-top: 2rem; /* pt-8 */
  border-top: 1px solid #e5e7eb; /* border-gray-200 */
}

:global(.dark) .logout-section {
  border-color: #374151; /* dark:border-gray-700 */
}
</style>
