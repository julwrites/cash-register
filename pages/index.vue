<template>
  <div class="index-container">
    <div v-if="isLoggedIn" class="main-content">
      <div class="page-tabs">
        <UTabs :items="pageItems" class="internal-tabs" @change="onPageTabChange" />
      </div>

      <div class="tab-content">
        <ExpenseForm v-if="selectedTab === 'form'" />
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
import SettingsPage from './settings.vue';

const route = useRoute();
const selectedTab = ref('form');
const { status, data } = useAuth();

const isLoggedIn = computed(() => status.value === 'authenticated');
const isAdmin = computed(() => data.value?.user?.isAdmin || false);

const pageItems = [
  {
    label: 'Add Record',
    slot: 'form',
  },
  {
    label: 'Expense List',
    slot: 'list',
  },
];

function onPageTabChange(index: number) {
  selectedTab.value = pageItems[index].slot;
}

// Set selected tab based on route or default
watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    // Keep current selectedTab or default to 'form'
    if (!selectedTab.value) {
      selectedTab.value = 'form';
    }
  }
}, { immediate: true });
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
