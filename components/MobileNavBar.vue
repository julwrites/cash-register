<template>
  <div class="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe block md:hidden">
    <div class="flex justify-around items-center h-16">
      <button
        v-for="item in items"
        :key="item.label"
        class="flex flex-col items-center justify-center w-full h-full space-y-1 focus:outline-none"
        :class="isActive(item) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
        @click="item.action"
      >
        <UIcon :name="item.icon" class="w-6 h-6" />
        <span class="text-xs font-medium">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const items = [
  {
    label: 'Add',
    icon: 'i-heroicons-plus-circle',
    action: () => router.push({ path: '/', query: { tab: 'form' } }),
    slot: 'form'
  },
  {
    label: 'Dashboard',
    icon: 'i-heroicons-chart-bar',
    action: () => router.push({ path: '/', query: { tab: 'dashboard' } }),
    slot: 'dashboard'
  },
  {
    label: 'List',
    icon: 'i-heroicons-list-bullet',
    action: () => router.push({ path: '/', query: { tab: 'list' } }),
    slot: 'list'
  },
   {
    label: 'Recurring',
    icon: 'i-heroicons-arrow-path',
    action: () => router.push({ path: '/', query: { tab: 'recurring' } }),
    slot: 'recurring'
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    action: () => router.push('/settings'),
    slot: 'settings'
  }
];

interface NavItem {
  label: string;
  icon: string;
  action: () => any;
  slot: string;
}

function isActive(item: NavItem) {
  if (item.slot === 'settings') {
    return route.path.startsWith('/settings');
  }
  // Check if we are on the home page
  if (route.path !== '/') return false;

  const currentTab = (route.query.tab as string) || 'form';
  return currentTab === item.slot;
}
</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
