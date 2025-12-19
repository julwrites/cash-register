<template>
  <div class="settings-container">
    <UForm class="settings-form" @submit.prevent="updateLogin">
      <UFormGroup label="New Username" name="username">
        <UInput id="username" v-model="newUsername" type="text" required />
      </UFormGroup>
      <UFormGroup label="New Password" name="password">
        <UInput id="password" v-model="newPassword" type="password" required />
      </UFormGroup>
      <UButton type="submit" color="primary" class="update-button"
        >Update Settings</UButton
      >
    </UForm>
    <p v-if="message" class="message">{{ message }}</p>

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
const message = ref('');

async function logout() {
  await signOut({ callbackUrl: '/login' });
}

function updateLogin() {
  fetch('/api/users/auth/updateLogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      newUsername: newUsername.value,
      newPassword: newPassword.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        message.value = 'Settings updated successfully';
        newUsername.value = '';
        newPassword.value = '';
      } else {
        message.value = data.message || 'Failed to update settings';
      }
    })
    .catch((error) => {
      console.error('Error updating settings:', error);
      message.value = 'An error occurred while updating settings';
    });
}
</script>

<style scoped>
.settings-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

:deep(.form-group label) {
  font-weight: bold;
}

:deep(.form-group input) {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.update-button {
  align-self: flex-start;
  padding: 10px 20px;
}

.message {
  margin-top: 20px;
  text-align: center;
  font-weight: bold;
}
</style>
