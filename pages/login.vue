<template>
  <div class="container">
    <UCard class="login-card">
      <h1 class="text-center mb-lg">{{ isFirstUser ? 'Welcome' : 'Login' }}</h1>
      <div v-if="isFirstUser">
        <p>
          It looks like you're the first user. Let's set up your admin account.
        </p>
        <UButton color="primary" block @click="showSetupModal = true">
          Set Up Admin Account
        </UButton>
      </div>
      <form v-else class="login-form" @submit.prevent="checkUser">
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
        <div v-if="showPasswordField" class="form-group">
          <label for="password" class="form-label">Password:</label>
          <UInput
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            required
          />
        </div>
        <div v-if="showPasswordField" class="form-group">
          <UCheckbox v-model="rememberMe" label="Remember me" />
        </div>
        <UButton
          type="submit"
          color="primary"
          block
          class="btn btn-primary login-button"
        >
          {{ showPasswordField ? 'Login' : 'Continue' }}
        </UButton>
      </form>
    </UCard>

    <UModal v-model="showSetPasswordModal">
      <SetPassword :username="username" @password-set="onPasswordSet" />
    </UModal>

    <UModal v-model="showSetupModal">
      <SetupAdminAccount @account-setup="onAccountSetup" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SetPassword from './components/SetPassword.vue';
import SetupAdminAccount from './components/SetupAdminAccount.vue';

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const router = useRouter();
const toast = useToast();
const showSetPasswordModal = ref(false);
const isFirstUser = ref(false);
const showSetupModal = ref(false);
const showPasswordField = ref(false);

onMounted(async () => {
  await checkFirstUser();
});

async function checkFirstUser() {
  try {
    const response = await $fetch('/api/users/auth/checkFirstUser', {
      method: 'GET',
    });
    isFirstUser.value = response.isFirstUser;
    if (isFirstUser.value) {
      showSetupModal.value = true;
    }
  } catch (error) {
    console.error('Error checking first user:', error);
  }
}

async function checkUser() {
  if (!showPasswordField.value) {
    try {
      const response = await $fetch('/api/users/check-status', {
        method: 'POST',
        body: { username: username.value },
      });

      if (response.userExists && response.needsPasswordReset) {
        showSetPasswordModal.value = true;
      } else {
        showPasswordField.value = true;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast.add({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        color: 'red',
      });
    }
  } else {
    await login();
  }
}

const { signIn } = useAuth();

async function login() {
  try {
    const result = await signIn('credentials', {
      username: username.value,
      password: password.value,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    router.push('/');
  } catch (error) {
    console.error('Login error:', error);
    toast.add({
      title: 'Login Failed',
      description: 'Invalid username or password',
      color: 'red',
    });
  }
}

function onPasswordSet() {
  showSetPasswordModal.value = false;
  showPasswordField.value = true;
  toast.add({
    title: 'Success',
    description:
      'Password set successfully. Please log in with your new password.',
    color: 'green',
  });
}

function onAccountSetup() {
  showSetupModal.value = false;
  toast.add({
    title: 'Success',
    description:
      'Admin account set up successfully. Please log in with your new credentials.',
    color: 'green',
  });
  isFirstUser.value = false;
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: var(--spacing-xl) auto;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.login-button {
  margin-top: var(--spacing-md);
}
</style>
