<template>
  <div class="h-full">
    <UContainer v-if="isLoggedIn" class="py-6 sm:py-8">
      <Dashboard
        v-if="selectedTab === 'dashboard'"
        @view-all="navigateToList"
      />
      <ExpenseForm v-else-if="selectedTab === 'form'" />
      <ExpenseList v-else-if="selectedTab === 'list'" />
    </UContainer>

    <UContainer v-else class="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div class="space-y-2">
        <UIcon name="i-heroicons-lock-closed" class="w-16 h-16 text-gray-400 mx-auto" />
        <p class="text-xl font-medium text-gray-700 dark:text-gray-200">
          Authentication Required
        </p>
        <p class="text-gray-500 dark:text-gray-400">
          You need to log in to access the expense tracker.
        </p>
      </div>
      <UButton to="/login" size="xl" color="primary" icon="i-heroicons-arrow-right-on-rectangle">
        Login
      </UButton>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ExpenseForm from './expense-form.vue';
import ExpenseList from './expense-list.vue';
import Dashboard from '@/components/Dashboard.vue';

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
