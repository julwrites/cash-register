<template>
  <div class="admin-container">
    <h2 class="page-title">Admin Dashboard</h2>

    <div class="admin-actions mb-4">
      <UButton
        class="mr-2"
        label="Create New User"
        @click="isCreateUserModalOpen = true"
      />
      <UButton
        class="mr-2"
        label="Migrate Descriptions"
        :loading="migrationLoading"
        color="green"
        @click="triggerDescriptionMigration"
      />
    </div>

    <div v-if="migrationResult" class="migration-status mb-4">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Migration Status</h3>
        </template>
        <div v-if="migrationResult.success" class="text-green-600">
          <p><strong>✓ Migration completed successfully!</strong></p>
          <div v-if="migrationResult.statistics" class="mt-2 text-sm">
            <p><strong>Statistics:</strong></p>
            <ul class="list-disc list-inside">
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
        <div v-else class="text-red-600">
          <p><strong>✗ Migration failed</strong></p>
          <p class="mt-1">
            {{ migrationResult.error || 'Unknown error occurred' }}
          </p>
        </div>
      </UCard>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="users-table">
      <div class="table-responsive">
        <UTable :rows="rows" :columns="columns">
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
    </div>

    <UModal v-model="isCreateUserModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Create New User</h3>
        </template>
        <form @submit.prevent="createUser">
          <UFormGroup label="Username">
            <UInput v-model="newUsername" type="text" required />
          </UFormGroup>
          <UButton type="submit" color="primary" class="mt-4"
            >Create User</UButton
          >
        </form>
      </UCard>
    </UModal>

    <!-- Reset Password Modal -->
    <UModal v-model="isResetPasswordModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-bold">Reset Password for {{ resetPasswordData.username }}</h3>
        </template>
        <form @submit.prevent="executeResetPassword">
          <UFormGroup label="New Password">
            <UInput v-model="resetPasswordData.password" type="password" required />
          </UFormGroup>
          <div class="flex justify-end mt-4 gap-2">
            <UButton color="gray" variant="ghost" @click="isResetPasswordModalOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary">Reset Password</UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete User Confirmation Modal -->
    <UModal v-model="isDeleteUserModalOpen">
      <div class="p-4">
        <h3 class="text-lg font-bold mb-2">Confirm Delete</h3>
        <p class="mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="isDeleteUserModalOpen = false">Cancel</UButton>
          <UButton color="red" @click="executeRemoveUser">Delete</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const loading = ref(true);
const error = ref(null);

const rows = ref([]);
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
const resetPasswordData = ref({ userId: null, username: '', password: '' });
const userToDeleteId = ref(null);
const migrationLoading = ref(false);
const migrationResult = ref(null);
const toast = useToast();

onMounted(async () => {
  try {
    const response = await fetch('/api/users/admin/getUsers');
    if (!response.ok) {
      throw new Error('You do not have permission to access this page');
    }
    users.value = await response.json();

    updateRows();

    loading.value = false;
  } catch (err) {
    error.value = err.message;
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

function actions(row) {
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

async function approveUser(userId) {
  try {
    const response = await fetch('/api/users/admin/approveUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to approve user');
    }

    const updatedUser = await response.json();
    const index = users.value.findIndex((user) => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
      updateRows();
      toast.add({ title: 'User approved successfully', color: 'green' });
    }
  } catch (err) {
    error.value = err.message;
    toast.add({
      title: 'Failed to approve user',
      description: err.message,
      color: 'red',
    });
  }
}

async function promoteUser(userId) {
  await updateAdmin(userId, { is_admin: true });
}

async function demoteUser(userId) {
  await updateAdmin(userId, { is_admin: false });
}

async function createUser() {
  try {
    const response = await fetch('/api/users/admin/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: newUsername.value }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const newUser = await response.json();
    users.value.push(newUser);
    updateRows();

    isCreateUserModalOpen.value = false;
    newUsername.value = '';
    toast.add({ title: 'User created successfully', color: 'green' });
  } catch (err) {
    error.value = err.message;
    toast.add({
      title: 'Failed to create user',
      description: err.message,
      color: 'red',
    });
  }
}

function confirmRemoveUser(userId) {
  userToDeleteId.value = userId;
  isDeleteUserModalOpen.value = true;
}

async function executeRemoveUser() {
  if (!userToDeleteId.value) return;

  const userId = userToDeleteId.value;
  try {
    const response = await fetch(`/api/users/admin/deleteUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove user');
    }
    users.value = users.value.filter((user) => user.id !== userId);
    updateRows();
    toast.add({ title: 'User removed successfully', color: 'green' });
    isDeleteUserModalOpen.value = false;
  } catch (err) {
    error.value = err.message;
    toast.add({
      title: 'Failed to remove user',
      description: err.message,
      color: 'red',
    });
  }
}

function openResetPasswordModal(userId, username) {
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
    const response = await fetch('/api/users/auth/setPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reset password');
    }

    toast.add({
      title: 'Password reset successfully',
      description: `New password for "${username}" has been set.`,
      color: 'green',
    });
    isResetPasswordModalOpen.value = false;
  } catch (err) {
    toast.add({
      title: 'Failed to reset password',
      description: err.message,
      color: 'red',
    });
  }
}

async function updateAdmin(userId, updates) {
  try {
    const response = await fetch(`/api/users/admin/setAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    const updatedUser = await response.json();
    const index = users.value.findIndex((user) => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
      updateRows();
      toast.add({ title: 'User updated successfully', color: 'green' });
    }
  } catch (err) {
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

    const response = await fetch('/api/descriptions/migrate', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to trigger migration');
    }

    const result = await response.json();
    migrationResult.value = result;
    toast.add({ title: 'Migration completed', color: 'green' });
  } catch (err) {
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
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.admin-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.loading,
.error,
.users-table {
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

:deep(.u-table) {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
}

:deep(.u-table th),
:deep(.u-table td) {
  padding: 10px;
  border: 1px solid #ccc;
  white-space: nowrap;
}

:deep(.u-table th) {
  background-color: #f2f2f2;
  font-weight: bold;
}

:deep(.u-dropdown) {
  min-width: auto;
}

@media (max-width: 768px) {
  :deep(.u-table) {
    font-size: 14px;
  }

  :deep(.u-table th),
  :deep(.u-table td) {
    padding: 8px;
  }
}
</style>
