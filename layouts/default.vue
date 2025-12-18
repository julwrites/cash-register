<template>
  <div class="layout">
    <header v-if="showHeader" class="header">
      <div class="header-content">
        <div class="nav-left">
          <h1 class="text-2xl font-bold cursor-pointer" @click="navigateTo('/')">
            Expense Tracker
          </h1>
        </div>

        <div class="nav-center">
          <UTabs
            :items="navItems"
            :model-value="selectedTabIndex"
            class="nav-tabs"
            @change="onNavChange"
          />
        </div>

        <div class="nav-right">
          <span class="text-sm mr-4">Welcome, {{ data?.user?.username }}</span>
          <UDropdown
            :items="settingsItems"
            :popper="{ placement: 'bottom-end' }"
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

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.nav-center {
  display: flex;
  justify-content: center;
  flex: 1;
}

.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

.nav-tabs {
  display: flex;
}

.nav-tabs :deep(.u-tab) {
  color: white;
  padding: 10px 15px;
  margin-right: 10px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.nav-tabs :deep(.u-tab.active) {
  border-bottom: 2px solid white;
}

.settings-btn {
  color: white !important;
}

.settings-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px; /* Account for fixed header (no footer now) */
  box-sizing: border-box;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main {
    padding: 70px 15px 30px;
  }

  .nav-tabs :deep(.u-tab) {
    padding: 8px 12px;
    margin-right: 5px;
    font-size: 14px;
  }

  .settings-btn {
    padding: 8px 12px !important;
    font-size: 14px !important;
  }
}

@media (max-width: 640px) {
  .main {
    padding: 65px 10px 25px;
  }

  .nav-tabs {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-tabs :deep(.u-tab) {
    padding: 6px 10px;
    margin: 2px;
    font-size: 13px;
  }

  .settings-btn {
    padding: 6px 10px !important;
    font-size: 13px !important;
  }

  .header-content {
    flex-direction: column;
    gap: 10px;
  }

  .nav-left, .nav-right {
    width: 100%;
    justify-content: center;
  }
}
</style>