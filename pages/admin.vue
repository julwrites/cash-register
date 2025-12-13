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
            <UDropdown :items="actions(row)">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from '#imports';

const toast = useToast();
const users = ref([]);
const loading = ref(true);
const error = ref(null);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

const rows = computed(() => {
  return users.value.map((user) => ({
    id: user.id,
    name: user.username,
    role: user.is_admin ? 'Admin' : 'User',
    status: user.is_approved ? 'Activated' : 'Pending',
  }));
});

const isCreateUserModalOpen = ref(false);
const newUsername = ref('');
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
    // Activated users
    if (row.role === 'User') {
      items.push({
        label: 'Promote',
        icon: 'i-heroicons-arrow-up-on-square-20-solid',
        click: () => promoteUser(row.id),
      });
    } else {
      // Admin
      items.push({
        label: 'Demote',
        icon: 'i-heroicons-arrow-down-on-square-20-solid',
        click: () => demoteUser(row.id),
      });
    }
  }

  items.push({
    label: 'Remove',
    icon: 'i-heroicons-trash-20-solid',
    click: () => removeUser(row.id),
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
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to approve user');
    }

    const updatedUser = await response.json();
    const index = users.value.findIndex((user) => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }
    toast.add({ title: 'User approved', color: 'green' });
  } catch (err) {
    error.value = err.message;
    toast.add({ title: 'Error approving user', description: err.message, color: 'red' });
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
    isCreateUserModalOpen.value = false;
    newUsername.value = '';
    toast.add({ title: 'User created', color: 'green' });
  } catch (err) {
    error.value = err.message;
    toast.add({ title: 'Error creating user', description: err.message, color: 'red' });
  }
}

async function removeUser(userId) {
  if (confirm('Are you sure you want to remove this user?')) {
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
      toast.add({ title: 'User removed', color: 'green' });
    } catch (err) {
      error.value = err.message;
      toast.add({ title: 'Error removing user', description: err.message, color: 'red' });
    }
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
    toast.add({ title: 'User role updated', color: 'green' });
  } catch (err) {
    error.value = err.message;
    toast.add({ title: 'Error updating user role', description: err.message, color: 'red' });
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
  max-width: 1000px;
  margin: 0 auto;
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
