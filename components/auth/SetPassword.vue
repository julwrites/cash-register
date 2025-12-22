<template>
  <UCard>
    <template #header>
      <h2 class="form-title">Set Your Password</h2>
    </template>
    <form class="password-form" @submit.prevent="setPassword">
      <UFormGroup label="New Password" name="password" required>
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
      <UButton type="submit" color="primary" block class="submit-button">
        Set Password
      </UButton>
    </form>
  </UCard>
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
.form-title {
  font-size: 1.25rem; /* text-xl */
  font-weight: 700; /* font-bold */
  text-align: center;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* gap-4 */
}

.submit-button {
  margin-top: 1rem; /* mt-4 */
}
</style>
