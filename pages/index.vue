<template>
  <div class="index-container">
    <div v-if="isLoggedIn" class="main-content">
      <div class="tab-content">
        <Dashboard
          v-if="selectedTab === 'dashboard'"
          @view-all="selectedTab = 'list'"
        />
        <ExpenseForm v-else-if="selectedTab === 'form'" />
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
