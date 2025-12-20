<template>
  <div class="layout-root">
    <header
      v-if="showHeader"
      class="app-header"
    >
      <div class="header-inner">
        <!-- Left: Logo -->
        <div class="logo-section">
          <h1
            class="logo-text"
            @click="navigateTo('/')"
          >
            Expense Tracker
          </h1>
          <div class="mobile-only">
            <ColorModeButton />
          </div>
        </div>

        <!-- Center: Tabs -->
        <div class="tabs-section desktop-only">
          <UTabs
            :items="navItems"
            :model-value="selectedTabIndex"
            class="nav-tabs"
            @change="onNavChange"
          />
        </div>

        <!-- Right: User & Settings -->
        <div class="user-section desktop-only">
          <span class="welcome-text">
            Welcome, {{ data?.user?.username }}
          </span>
          <ColorModeButton />
          <UDropdown
            :items="settingsItems"
            :popper="{ placement: 'bottom-end', strategy: 'fixed' }"
          >
            <UButton
              color="white"
              variant="ghost"
              trailing-icon="i-heroicons-cog-6-tooth-20-solid"
              class="settings-btn"
            >
              Settings
            </UButton>
          </UDropdown>
        </div>
      </div>
    </header>

    <main class="main-content">
      <slot />
    </main>
    <MobileNavBar v-if="showHeader" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

const route = useRoute();
const { status, data, signOut } = useAuth();

const isLoggedIn = computed(() => status.value === 'authenticated');
const isAdmin = computed(() => data.value?.user?.isAdmin || false);

// Show header only when logged in and not on login page
const showHeader = computed(() => isLoggedIn.value && route.path !== '/login');

const navItems = [
  { label: 'Add Record', slot: 'form' },
  { label: 'Dashboard', slot: 'dashboard' },
  { label: 'Expense List', slot: 'list' },
  { label: 'Recurring', slot: 'recurring' },
];

const selectedTabIndex = computed(() => {
  const tab = route.query.tab as string;
  const index = navItems.findIndex((item) => item.slot === tab);
  return index === -1 ? 0 : index;
});

function onNavChange(index: number) {
  const tab = navItems[index].slot;
  navigateTo({ path: '/', query: { tab } });
}

const settingsItems = computed(() => {
  const items = [
    [
      {
        label: 'User Settings',
        icon: 'i-heroicons-user-circle-20-solid',
        click: () => navigateTo('/settings'),
      },
    ],
  ];

  if (isAdmin.value) {
    items[0].push(
      {
        label: 'Admin',
        icon: 'i-heroicons-shield-check-20-solid',
        click: () => navigateTo('/settings?tab=admin'),
      },
      {
        label: 'Manage Categories',
        icon: 'i-heroicons-tag-20-solid',
        click: () => navigateTo('/settings?tab=manage-categories'),
      }
    );
  }

  items.push([
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-left-on-rectangle-20-solid',
      click: logout,
    },
  ]);

  return items;
});

async function logout() {
  await signOut({ callbackUrl: '/login' });
}

onMounted(() => {
  if (isLoggedIn.value) {
    $fetch('/api/recurring/process', { method: 'POST' })
      .then((res: any) => {
        if (res.processed > 0) {
          useToast().add({
            title: 'Recurring Expenses Processed',
            description: `${res.processed} new expenses created.`,
            color: 'green',
          });
        }
      })
      .catch(() => {});
  }
});
</script>

<style scoped>
.layout-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-gray-50);
  transition: background-color 0.2s;
}

:global(.dark) .layout-root {
  background-color: var(--color-gray-900);
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background-color: var(--color-primary-600);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.header-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
  max-width: 1280px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .header-inner {
    flex-direction: row;
    padding: 0 1rem;
    height: 4rem;
  }
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

@media (min-width: 768px) {
  .logo-section {
    width: auto;
  }
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s;
}

.logo-text:hover {
  color: var(--color-primary-100);
}

.tabs-section {
  flex: 1;
  justify-content: center;
  width: 100%;
}

@media (min-width: 768px) {
  .tabs-section {
    width: auto;
  }
}

.user-section {
  align-items: center;
  gap: 1rem;
  justify-content: flex-end;
  width: 100%;
}

@media (min-width: 768px) {
  .user-section {
    width: auto;
  }
}

.welcome-text {
  font-size: 0.875rem;
  font-weight: 500;
  display: none;
}

@media (min-width: 640px) {
  .welcome-text {
    display: inline;
  }
}

.mobile-only {
  display: block;
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
  .desktop-only {
    display: flex;
  }
}

.main-content {
  flex: 1;
  width: 100%;
  padding-bottom: 4rem;
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 0;
  }
}

.nav-tabs {
  width: 100%;
  max-width: 28rem;
}
</style>
