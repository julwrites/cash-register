<template>
  <div class="layout">
    <header class="header" v-if="showHeader">
      <div class="header-content">
        <UTabs :items="navItems" class="nav-tabs" @change="onNavChange" />
      </div>
    </header>

    <main class="main">
      <slot />
    </main>

    <footer class="footer" v-if="showFooter">
      <div class="footer-content">
        <UButton class="logout-btn" @click="logout">Logout</UButton>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();
const { status, signOut } = useAuth();

const isLoggedIn = computed(() => status.value === 'authenticated');

// Show header/footer only when logged in and not on login page
const showHeader = computed(() => isLoggedIn.value && route.path !== '/login');
const showFooter = computed(() => isLoggedIn.value && route.path !== '/login');

const navItems = [
  { label: 'Home', slot: 'home' },
  { label: 'Settings', slot: 'settings' },
];

const activeTab = computed(() => {
  if (route.path === '/settings') return 'settings';
  return 'home'; // Default to 'home' for all other pages
});

function onNavChange(index: number) {
  const item = navItems[index];
  if (item.slot === 'settings') {
    navigateTo('/settings');
  } else {
    navigateTo('/');
  }
}

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
  justify-content: center;
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

.main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 100px; /* Account for fixed header and footer */
  box-sizing: border-box;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #f8f9fa;
  padding: 10px 20px;
  text-align: right;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: right;
}

.logout-btn {
  padding: 10px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main {
    padding: 70px 15px 90px;
  }

  .nav-tabs :deep(.u-tab) {
    padding: 8px 12px;
    margin-right: 5px;
    font-size: 14px;
  }
}

@media (max-width: 640px) {
  .main {
    padding: 65px 10px 85px;
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
}
</style>