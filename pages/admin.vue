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
        @click="triggerDescriptionMigration"
        :loading="migrationLoading"
        color="green"
      />
      <UButton
        label="Migration Schedule"
        @click="isScheduleModalOpen = true"
        color="blue"
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
              <li>Total descriptions: {{ migrationResult.statistics.totalDescriptions }}</li>
              <li>Total usage count: {{ migrationResult.statistics.totalUsageCount }}</li>
              <li>Years processed: {{ migrationResult.statistics.yearsProcessed.join(', ') }}</li>
              <li>Migration time: {{ migrationResult.statistics.migrationTime }}</li>
            </ul>
          </div>
        </div>
        <div v-else class="text-red-600">
          <p><strong>✗ Migration failed</strong></p>
          <p class="mt-1">{{ migrationResult.error || 'Unknown error occurred' }}</p>
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
              <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
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
        <UButton type="submit" color="primary" class="mt-4">Create User</UButton>
      </form>
    </UCard>
  </UModal>

  <UModal v-model="isScheduleModalOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-bold">Migration Schedule Settings</h3>
      </template>
      <form @submit.prevent="updateMigrationSchedule">
        <UFormGroup label="Enable Scheduled Migration" class="mb-4">
          <UToggle v-model="scheduleForm.enabled" />
        </UFormGroup>
        <UFormGroup label="Time (24-hour format)" class="mb-4">
          <UInput v-model="scheduleForm.time" type="time" required />
        </UFormGroup>
        <UFormGroup label="Frequency" class="mb-4">
          <USelectMenu v-model="scheduleForm.frequency" :options="frequencyOptions" required />
        </UFormGroup>
        <div class="flex justify-between mt-4">
          <UButton type="submit" color="primary" :loading="scheduleLoading">Save Schedule</UButton>
          <UButton type="button" color="gray" @click="isScheduleModalOpen = false">Cancel</UButton>
        </div>
        <p class="text-sm text-gray-500 mt-2">Note: Server restart required for schedule changes to take effect.</p>
      </form>
    </UCard>
  </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const { getItem } = useLocalStorage();

const router = useRouter();
const users = ref([]);
const loading = ref(true);
const error = ref(null);

const rows = ref([]);
const columns = [
  {key: 'id', label: 'ID'},
  {key: 'name', label: 'Name'},
  {key: 'role', label: 'Role'},
  {key: 'status', label: 'Status'},
  {key: 'actions', label: 'Actions'},
]

const isCreateUserModalOpen = ref(false);
const newUsername = ref('');
const migrationLoading = ref(false);
const migrationResult = ref(null);

const isScheduleModalOpen = ref(false);
const scheduleLoading = ref(false);
const scheduleForm = ref({
  enabled: true,
  time: '00:00',
  frequency: 'daily'
});
const frequencyOptions = ['daily', 'weekly', 'monthly'];

onMounted(async () => {
  try {
    const token = getItem('authToken');
    const response = await fetch('/api/users/admin/getUsers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('You do not have permission to access this page');
    }
    users.value = await response.json();

    rows.value = users.value.map(user => {
      return {
        id: user.id,
        name: user.username,
        role: user.is_admin ? 'Admin' : 'User',
        status: user.is_approved ? 'Activated' : 'Pending',
      };
    });

    const scheduleResponse = await fetch('/api/settings/migration-schedule');
    if (scheduleResponse.ok) {
      const currentSchedule = await scheduleResponse.json();
      scheduleForm.value = currentSchedule;
    }

    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
});

function actions(row) {
  return [[
    {
      label: row.status === 'Activated' && row.role === 'User' ? 'Promote' : 'Demote',
      icon: row.role === 'User' ? 'i-heroicons-arrow-up-on-square-20-solid' : 'i-heroicons-arrow-down-on-square-20-solid',
      click: () => row.role === 'Admin' ? demoteUser(row.id) : promoteUser(row.id)
    },
    {
      label: 'Remove',
      icon: 'i-heroicons-check-circle-20-solid',
      click: () => removeUser(row.id)
    }
  ]]
}

async function promoteUser(userId) {
  await updateAdmin(userId, { is_admin: true });
}

async function demoteUser(userId) {
  await updateAdmin(userId, { is_admin: false });
}

async function createUser() {
  try {
    const token = getItem('authToken');
    const response = await fetch('/api/users/admin/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: newUsername.value }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const newUser = await response.json();
    users.value.push(newUser);
    rows.value.push({
      id: newUser.id,
      name: newUser.username,
      role: newUser.is_admin ? 'Admin' : 'User',
      status: newUser.is_approved ? 'Activated' : 'Pending',
    });

    isCreateUserModalOpen.value = false;
    newUsername.value = '';
  } catch (err) {
    error.value = err.message;
  }
}

async function removeUser(userId) {
  if (confirm('Are you sure you want to remove this user?')) {
    try {
      const token = getItem('authToken');
      const response = await fetch(`/api/users/admin/deleteUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove user');
      }
      users.value = users.value.filter(user => user.Id !== userId);
    } catch (err) {
      error.value = err.message;
    }
  }
}

async function updateAdmin(userId, updates) {
  try {
    const token = getItem('authToken');
    const response = await fetch(`/api/users/admin/setAdmin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, ...updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    const updatedUser = await response.json();
    const index = users.value.findIndex(user => user.id === userId);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }
  } catch (err) {
    error.value = err.message;
  }
}

async function triggerDescriptionMigration() {
  try {
    migrationLoading.value = true;
    migrationResult.value = null;

    const token = getItem('authToken');
    const response = await fetch('/api/descriptions/migrate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to trigger migration');
    }

    const result = await response.json();
    migrationResult.value = result;
  } catch (err) {
    error.value = err.message;
    alert(`Migration error: ${err.message}`);
  } finally {
    migrationLoading.value = false;
  }
}

async function updateMigrationSchedule() {
  try {
    scheduleLoading.value = true;

    const token = getItem('authToken');
    const response = await fetch('/api/settings/migration-schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(scheduleForm.value)
    });

    if (!response.ok) {
      throw new Error('Failed to update migration schedule');
    }

    const result = await response.json();
    alert(result.message || 'Migration schedule updated successfully!');
    isScheduleModalOpen.value = false;
  } catch (err) {
    error.value = err.message;
    alert(`Schedule update error: ${err.message}`);
  } finally {
    scheduleLoading.value = false;
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