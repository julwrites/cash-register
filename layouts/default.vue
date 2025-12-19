<template>
  <div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <header
      v-if="showHeader"
      class="sticky top-0 z-50 w-full bg-primary-600 text-white shadow-md"
    >
      <UContainer class="flex flex-col md:flex-row justify-between items-center py-2 md:py-0 md:h-16 gap-2">
        <!-- Left: Logo -->
        <div class="flex items-center justify-between w-full md:w-auto">
          <h1
            class="text-xl font-bold cursor-pointer hover:text-primary-100 transition-colors"
            @click="navigateTo('/')"
          >
            Expense Tracker
          </h1>
          <!-- Mobile User (optional, or just keep layout simple) -->
        </div>

        <!-- Center: Tabs -->
        <div class="flex-1 hidden md:flex justify-center w-full md:w-auto order-last md:order-none">
          <UTabs
            :items="navItems"
            :model-value="selectedTabIndex"
            class="w-full max-w-md"
            :ui="{
              list: {
                background: 'bg-primary-700 dark:bg-primary-800',
                marker: { background: 'bg-white dark:bg-gray-100' },
                tab: {
                  active: 'text-primary-600 dark:text-primary-800',
                  inactive: 'text-primary-100 hover:text-white',
                }
              }
            }"
            @change="onNavChange"
          />
        </div>

        <!-- Right: User & Settings -->
        <div class="hidden md:flex items-center gap-4 justify-end w-full md:w-auto">
          <span class="text-sm hidden sm:inline font-medium">
            Welcome, {{ data?.user?.username }}
          </span>
          <UDropdown
            :items="settingsItems"
            :popper="{ placement: 'bottom-end', strategy: 'fixed' }"
          >
            <UButton
              color="white"
              variant="ghost"
              trailing-icon="i-heroicons-cog-6-tooth-20-solid"
              class="hover:bg-primary-500 text-white hover:text-white ring-1 ring-transparent hover:ring-primary-400"
            >
              Settings
            </UButton>
          </UDropdown>
        </div>
      </UContainer>
    </header>

    <main class="flex-1 w-full pb-16 md:pb-0">
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
