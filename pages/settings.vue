<template>
  <div class="settings-container">
    <div class="settings-content">
      <div class="settings-header">
        <h2 class="settings-title">{{ pageTitle }}</h2>
      </div>

      <div class="settings-tab-content">
        <UserSettings v-if="activeTab === 'user-settings'" />
        <AdminPage v-else-if="activeTab === 'admin' && isAdmin" />
        <ManageCategoriesPage
          v-else-if="activeTab === 'manage-categories' && isAdmin"
        />
        <div v-else class="no-access">
          <p>You don't have access to this section.</p>
          <UButton @click="navigateTo('/settings')">Go to User Settings</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import AdminPage from './admin.vue';
import ManageCategoriesPage from './manage-categories.vue';
import UserSettings from './user-settings.vue';

const route = useRoute();
const { data } = useAuth();
const isAdmin = computed(() => data.value?.user?.isAdmin || false);

const activeTab = computed(() => {
  const tab = route.query.tab as string;
  if (tab === 'admin' && isAdmin.value) return 'admin';
  if (tab === 'manage-categories' && isAdmin.value) return 'manage-categories';
  return 'user-settings'; // Default
});

const pageTitle = computed(() => {
  switch (activeTab.value) {
    case 'admin':
      return 'Admin Dashboard';
    case 'manage-categories':
      return 'Manage Categories';
    default:
      return 'User Settings';
  }
});

// Watch for tab changes and update query params
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === 'admin' && !isAdmin.value) {
      navigateTo('/settings');
    }
    if (newTab === 'manage-categories' && !isAdmin.value) {
      navigateTo('/settings');
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.settings-content {
  padding: 20px;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.settings-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.settings-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.settings-tab-content {
  width: 100%;
}

.no-access {
  text-align: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.no-access p {
  margin-bottom: 20px;
  font-size: 16px;
  color: #4a5568;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .settings-title {
    font-size: 20px;
  }

  .settings-content {
    padding: 15px;
  }
}

@media (max-width: 640px) {
  .settings-title {
    font-size: 18px;
  }

  .settings-content {
    padding: 10px;
  }
}
</style>
