<template>
  <div class="mobile-nav-bar">
    <div class="nav-content">
      <button
        v-for="item in items"
        :key="item.label"
        class="nav-item"
        :class="isActive(item) ? 'nav-item-active' : ''"
        @click="item.action"
      >
        <UIcon :name="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
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
.mobile-nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
  display: block;
}

:global(.dark) .mobile-nav-bar {
  /* Handled by vars */
}

@media (min-width: 768px) {
  .mobile-nav-bar {
    display: none;
  }
}

.nav-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 4rem; /* h-16 */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 0.25rem; /* space-y-1 */
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

:global(.dark) .nav-item {
  /* Handled by vars */
}

.nav-item:focus {
  outline: none;
}

.nav-item:hover {
  color: var(--color-text-body);
}

:global(.dark) .nav-item:hover {
  /* Handled by vars */
}

.nav-item-active {
  color: var(--color-primary) !important;
}

:global(.dark) .nav-item-active {
  /* Handled by vars */
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.nav-label {
  font-size: 0.75rem; /* text-xs */
  font-weight: 500;
}
</style>
