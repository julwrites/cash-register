<template>
  <div class="set-password-modal">
    <h2 class="text-center mb-lg">Set Your Password</h2>
    <form class="set-password-form" @submit.prevent="setPassword">
      <div class="form-group">
        <label for="password" class="form-label">New Password:</label>
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
        class="btn btn-primary set-password-button"
      >
        Set Password
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  username: string;
}>();

const emit = defineEmits(['passwordSet']);

const password = ref('');
const confirmPassword = ref('');
const currentUserId = ref('');
const toast = useToast();

watch(
  () => props.username,
  (newUsername) => {
    console.log('Received new username in SetPassword:', newUsername);
    currentUserId.value = newUsername;
  },
  { immediate: true }
);

async function setPassword() {
  if (password.value !== confirmPassword.value) {
    toast.add({
      title: 'Error',
      description: 'Passwords do not match',
      color: 'red',
    });
    return;
  }

  try {
    console.log(
      'Attempting to set password for username:',
      currentUserId.value
    );
    const response = await $fetch('/api/users/auth/setPassword', {
      method: 'POST',
      body: { username: currentUserId.value, password: password.value },
    });

    if (response.success) {
      emit('passwordSet');
    } else {
      throw new Error('Failed to set password');
    }
  } catch (error) {
    console.error('Set password error:', error);
    toast.add({
      title: 'Error',
      description: 'An error occurred while setting the password',
      color: 'red',
    });
  }
}
</script>

<style scoped>
.set-password-modal {
  padding: var(--spacing-md);
}

.set-password-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.set-password-button {
  margin-top: var(--spacing-md);
}
</style>
