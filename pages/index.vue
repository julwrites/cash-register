<template>
  <div class="index-container">
    <div v-if="isLoggedIn" class="main-content">
      <div class="app-header mb-4">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold">Expense Tracker</h1>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >Welcome, {{ data?.user?.username }}</span
            >
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-right-on-rectangle-20-solid"
              label="Logout"
              @click="handleLogout"
            />
          </div>
        </div>

        <div class="page-tabs">
          <UTabs
            :items="pageItems"
            class="internal-tabs"
            @change="onPageTabChange"
          />
        </div>
      </div>

      <div class="tab-content">
        <Dashboard
          v-if="selectedTab === 'dashboard'"
          @view-all="selectedTab = 'list'"
        />
        <ExpenseForm v-else-if="selectedTab === 'form'" />
        <ExpenseList v-else-if="selectedTab === 'list'" />
      </div>
    </div>
    <div v-else class="login-prompt">
      <p>You need to log in to access the expense tracker.</p>
      <router-link to="/login">Login</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ExpenseForm from './expense-form.vue';
import ExpenseList from './expense-list.vue';
import Dashboard from '@/components/Dashboard.vue';

const route = useRoute();
const selectedTab = ref('form');
const { status, data, signOut } = useAuth();
const toast = useToast();

const isLoggedIn = computed(() => status.value === 'authenticated');

const pageItems = [
  {
    label: 'Add Record',
    slot: 'form',
  },
  {
    label: 'Dashboard',
    slot: 'dashboard',
  },
  {
    label: 'Expense List',
    slot: 'list',
  },
];

function onPageTabChange(index: number) {
  selectedTab.value = pageItems[index].slot;
}

async function handleLogout() {
  await signOut({ callbackUrl: '/login' });
  toast.add({ title: 'Logged out successfully', color: 'green' });
}

// Set selected tab based on route or default
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') {
      // Keep current selectedTab or default to 'form'
      if (!selectedTab.value) {
        selectedTab.value = 'form';
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.index-container {
  width: 100%;
  min-height: 100%;
}

.main-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-tabs {
  margin-bottom: 20px;
}

.internal-tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.internal-tabs :deep(.u-tab) {
  padding: 10px 15px;
  margin-right: 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #4a5568;
}

.internal-tabs :deep(.u-tab.active) {
  border-bottom: 2px solid #007bff;
  color: #007bff;
}

.tab-content {
  width: 100%;
}

.login-prompt {
  text-align: center;
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.login-prompt p {
  margin-bottom: 20px;
  font-size: 18px;
}

.login-prompt a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.login-prompt a:hover {
  text-decoration: underline;
}
</style>
