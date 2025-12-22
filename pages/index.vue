<template>
  <div class="page-root">
    <div v-if="isLoggedIn" class="content-container">
      <Dashboard
        v-if="selectedTab === 'dashboard'"
        @view-all="navigateToList"
      />
      <div v-else-if="selectedTab === 'form'" class="form-wrapper">
        <AddExpense />
      </div>
      <ExpenseList v-else-if="selectedTab === 'list'" />
      <RecurringExpenses v-else-if="selectedTab === 'recurring'" />
    </div>

    <div v-else class="auth-container">
      <div class="auth-message">
        <UIcon name="i-heroicons-lock-closed" class="auth-icon" />
        <p class="auth-title">
          Authentication Required
        </p>
        <p class="auth-subtitle">
          You need to log in to access the expense tracker.
        </p>
      </div>
      <UButton to="/login" size="xl" color="primary" icon="i-heroicons-arrow-right-on-rectangle">
        Login
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AddExpense from '@/components/AddExpense.vue';
import ExpenseList from './expense-list.vue';
import Dashboard from '@/components/Dashboard.vue';
import RecurringExpenses from '@/components/RecurringExpenses.vue';

const route = useRoute();
const { status } = useAuth();

const isLoggedIn = computed(() => status.value === 'authenticated');

const selectedTab = computed(() => {
  return (route.query.tab as string) || 'form';
});

function navigateToList() {
  navigateTo({ path: '/', query: { tab: 'list' } });
}
</script>

<style scoped>
.page-root {
  height: 100%;
}

.content-container {
  padding: 1.5rem 0;
  width: 100%;
}

@media (min-width: 640px) {
  .content-container {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}

.form-wrapper {
  max-width: 42rem;
  margin: 0 auto;
}

.auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.5rem;
  text-align: center;
  padding: 1rem;
}

.auth-message {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto;
  color: var(--color-text-muted);
}

.auth-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text-body);
}

.auth-subtitle {
  color: var(--color-text-muted);
}
</style>
