<template>
  <div class="admin-container">
    <div class="action-bar">
      <UButton
        class="action-btn"
        label="Create New User"
        @click="isCreateUserModalOpen = true"
      />
      <UButton
        class="action-btn"
        label="Migrate Descriptions"
        :loading="migrationLoading"
        color="green"
        @click="triggerDescriptionMigration"
      />
    </div>

    <div v-if="migrationResult" class="migration-status">
      <UCard>
        <template #header>
          <h3 class="section-title">Migration Status</h3>
        </template>
        <div v-if="migrationResult.success" class="status-success">
          <p><strong>✓ Migration completed successfully!</strong></p>
          <div v-if="migrationResult.statistics" class="stats-container">
            <p><strong>Statistics:</strong></p>
            <ul class="stats-list">
              <li>
                Total descriptions:
                {{ migrationResult.statistics.totalDescriptions }}
              </li>
              <li>
                Total usage count:
                {{ migrationResult.statistics.totalUsageCount }}
              </li>
              <li>
                Years processed:
                {{ migrationResult.statistics.yearsProcessed.join(', ') }}
              </li>
              <li>
                Migration time: {{ migrationResult.statistics.migrationTime }}
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="status-error">
          <p><strong>✗ Migration failed</strong></p>
          <p class="error-msg">
            {{ migrationResult.error || 'Unknown error occurred' }}
          </p>
        </div>
      </UCard>
    </div>

    <div v-if="loading" class="loading-container">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="spinner" />
    </div>
    <div v-else-if="error" class="error-banner">{{ error }}</div>
    <div v-else class="table-container">
      <div class="desktop-view">
        <UTable :rows="rows" :columns="columns" class="users-table">
          <template #actions-data="{ row }">
            <UDropdown :items="actions(row)" :popper="{ strategy: 'fixed' }">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
            </UDropdown>
          </template>
        </UTable>
      </div>
      <div class="mobile-view">
        <div v-for="row in rows" :key="row.id" class="mobile-card">
          <div class="mobile-card-header">
            <div>
              <div class="mobile-card-title">{{ row.name }}</div>
              <div class="mobile-card-meta">{{ row.role }} • {{ row.status }}</div>
            </div>
            <UDropdown :items="actions(row)" :popper="{ strategy: 'fixed' }">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
            </UDropdown>
          </div>
          <div class="mobile-card-details">
            ID: {{ row.id }}
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="isCreateUserModalOpen">
      <UCard>
        <template #header>
          <h3 class="section-title">Create New User</h3>
        </template>
        <form @submit.prevent="createUser">
          <UFormGroup label="Username" name="username">
            <UInput v-model="newUsername" type="text" required />
          </UFormGroup>
          <UButton type="submit" color="primary" class="form-submit-btn" block>Create User</UButton>
        </form>
      </UCard>
    </UModal>

    <!-- Reset Password Modal -->
    <UModal v-model="isResetPasswordModalOpen">
      <UCard>
        <template #header>
          <h3 class="section-title">Reset Password for {{ resetPasswordData.username }}</h3>
        </template>
        <form @submit.prevent="executeResetPassword">
          <UFormGroup label="New Password" name="password">
            <UInput v-model="resetPasswordData.password" type="password" required />
          </UFormGroup>
          <div class="modal-actions">
            <UButton color="gray" variant="ghost" @click="isResetPasswordModalOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary">Reset Password</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete User Confirmation Modal -->
    <UModal v-model="isDeleteUserModalOpen">
      <UCard>
        <template #header>
          <h3 class="section-title">Confirm Delete</h3>
        </template>
        <div class="modal-body">
          <p class="modal-text">Are you sure you want to delete this user? This action cannot be undone.</p>
          <div class="modal-actions">
            <UButton color="gray" variant="ghost" @click="isDeleteUserModalOpen = false">Cancel</UButton>
            <UButton color="red" @click="executeRemoveUser">Delete</UButton>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface User {
  id: number;
  username: string;
  is_admin: boolean;
  is_approved: boolean;
}

interface MigrationStatistics {
  totalDescriptions: number;
  totalUsageCount: number;
  yearsProcessed: number[];
  migrationTime: string;
}

interface MigrationResult {
  success: boolean;
  statistics?: MigrationStatistics;
  error?: string;
}

const users = ref<User[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const rows = ref<any[]>([]);
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

const isCreateUserModalOpen = ref(false);
const isResetPasswordModalOpen = ref(false);
const isDeleteUserModalOpen = ref(false);
const newUsername = ref('');
const resetPasswordData = ref<{ userId: number | null; username: string; password: string }>({ userId: null, username: '', password: '' });
const userToDeleteId = ref<number | null>(null);
const migrationLoading = ref(false);
const migrationResult = ref<MigrationResult | null>(null);
const toast = useToast();

onMounted(async () => {
  try {
    users.value = await $fetch<User[]>('/api/users/admin/getUsers');
    updateRows();
    loading.value = false;
  } catch (err: any) {
    error.value = err.message || 'You do not have permission to access this page';
    loading.value = false;
  }
});

function updateRows() {
  rows.value = users.value.map((user) => {
    return {
      id: user.id,
      name: user.username,
      role: user.is_admin ? 'Admin' : 'User',
      status: user.is_approved ? 'Activated' : 'Pending',
    };
  });
}

function actions(row: any) {
  const items = [];

  if (row.status === 'Pending') {
    items.push({
      label: 'Approve',
      icon: 'i-heroicons-check-20-solid',
      click: () => approveUser(row.id),
    });
  } else {
    items.push({
      label:
        row.status === 'Activated' && row.role === 'User'
          ? 'Promote'
          : 'Demote',
      icon:
        row.role === 'User'
          ? 'i-heroicons-arrow-up-on-square-20-solid'
          : 'i-heroicons-arrow-down-on-square-20-solid',
      click: () =>
        row.role === 'Admin' ? demoteUser(row.id) : promoteUser(row.id),
    });
  }

  items.push({
    label: 'Reset Password',
    icon: 'i-heroicons-lock-closed-20-solid',
    click: () => openResetPasswordModal(row.id, row.name),
  });

  items.push({
    label: 'Remove',
    icon: 'i-heroicons-trash-20-solid',
    click: () => confirmRemoveUser(row.id),
  });

  return [items];
}

async function approveUser(userId: number) {
  try {
    const updatedUser = await $fetch<User>('/api/users/admin/approveUser', {
      method: 'POST',
      body: { userId: userId },
    });

    const index = users.value.findIndex((user) => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
      updateRows();
      toast.add({ title: 'User approved successfully', color: 'green' });
    }
  } catch (err: any) {
    error.value = err.message;
    toast.add({
      title: 'Failed to approve user',
      description: err.message,
      color: 'red',
    });
  }
}

async function promoteUser(userId: number) {
  await updateAdmin(userId, { is_admin: true });
}

async function demoteUser(userId: number) {
  await updateAdmin(userId, { is_admin: false });
}

async function createUser() {
  try {
    const newUser = await $fetch<User>('/api/users/admin/createUser', {
      method: 'POST',
      body: { username: newUsername.value },
    });

    users.value.push(newUser);
    updateRows();

    isCreateUserModalOpen.value = false;
    newUsername.value = '';
    toast.add({ title: 'User created successfully', color: 'green' });
  } catch (err: any) {
    error.value = err.message;
    toast.add({
      title: 'Failed to create user',
      description: err.message,
      color: 'red',
    });
  }
}

function confirmRemoveUser(userId: number) {
  userToDeleteId.value = userId;
  isDeleteUserModalOpen.value = true;
}

async function executeRemoveUser() {
  if (!userToDeleteId.value) return;

  const userId = userToDeleteId.value;
  try {
    await $fetch(`/api/users/admin/deleteUser`, {
      method: 'POST',
      body: { userId: userId },
    });

    users.value = users.value.filter((user) => user.id !== userId);
    updateRows();
    toast.add({ title: 'User removed successfully', color: 'green' });
    isDeleteUserModalOpen.value = false;
  } catch (err: any) {
    error.value = err.message;
    toast.add({
      title: 'Failed to remove user',
      description: err.message,
      color: 'red',
    });
  }
}

function openResetPasswordModal(userId: number, username: string) {
  resetPasswordData.value = { userId, username, password: '' };
  isResetPasswordModalOpen.value = true;
}

async function executeResetPassword() {
  const { username, password } = resetPasswordData.value;

  if (password.length < 6) {
    toast.add({
      title: 'Validation Error',
      description: 'Password must be at least 6 characters long.',
      color: 'red',
    });
    return;
  }

  try {
    await $fetch('/api/users/auth/setPassword', {
      method: 'POST',
      body: { username, password },
    });

    toast.add({
      title: 'Password reset successfully',
      description: `New password for "${username}" has been set.`,
      color: 'green',
    });
    isResetPasswordModalOpen.value = false;
  } catch (err: any) {
    toast.add({
      title: 'Failed to reset password',
      description: err.message || err.data?.message,
      color: 'red',
    });
  }
}

async function updateAdmin(userId: number, updates: Partial<User>) {
  try {
    const updatedUser = await $fetch<User>(`/api/users/admin/setAdmin`, {
      method: 'POST',
      body: { userId, ...updates },
    });

    const index = users.value.findIndex((user) => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
      updateRows();
      toast.add({ title: 'User updated successfully', color: 'green' });
    }
  } catch (err: any) {
    error.value = err.message;
    toast.add({
      title: 'Failed to update user',
      description: err.message,
      color: 'red',
    });
  }
}

async function triggerDescriptionMigration() {
  try {
    migrationLoading.value = true;
    migrationResult.value = null;

    const result = await $fetch<MigrationResult>('/api/descriptions/migrate', {
      method: 'POST',
    });

    migrationResult.value = result;
    toast.add({ title: 'Migration completed', color: 'green' });
  } catch (err: any) {
    error.value = err.message;
    toast.add({
      title: 'Migration failed',
      description: err.message,
      color: 'red',
    });
  } finally {
    migrationLoading.value = false;
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 80rem; /* max-w-7xl */
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
  margin-right: 0.5rem;
}

.migration-status {
  margin-bottom: 1rem;
}

.section-title {
  margin-bottom: 0;
}

.status-success {
  color: var(--color-success);
}

.status-error {
  color: var(--color-danger);
}

.stats-container {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.stats-list {
  list-style-type: disc;
  list-style-position: inside;
}

.error-msg {
  margin-top: 0.25rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  color: var(--color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-banner {
  color: var(--color-danger);
  padding: 1rem;
  border: 1px solid var(--color-danger);
  border-radius: 0.25rem;
}

.table-container {
  width: 100%;
}

.desktop-view {
  display: none;
}

@media (min-width: 768px) {
  .desktop-view {
    display: block;
    overflow-x: auto;
  }
}

.mobile-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .mobile-view {
    display: none;
  }
}

.mobile-card {
  padding: 1rem;
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border-card);
  border-radius: 0.5rem;
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.mobile-card-title {
  font-weight: 600;
  color: var(--color-text-body);
}

.mobile-card-meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.mobile-card-details {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.users-table {
  width: 100%;
}

.form-submit-btn {
  margin-top: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 0.5rem;
}

.modal-body {
  padding: 1rem;
}

.modal-text {
  margin-bottom: 1rem;
}
</style>
