<template>
  <div class="recurring-container">
    <div class="header-row">
      <h3 class="page-title">Recurring Expenses</h3>
      <div class="actions-group">
        <UButton :loading="processing" icon="i-heroicons-arrow-path" color="gray" @click="processRules">
          <span class="desktop-label">Process Now</span>
        </UButton>
        <UButton icon="i-heroicons-plus" @click="openModal()">
          <span class="desktop-label">Add Rule</span>
          <span class="mobile-label">Add</span>
        </UButton>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="desktop-table-container">
      <UTable :loading="loading" :rows="rules" :columns="columns">
         <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
        <template #active-data="{ row }">
          <UBadge :color="row.active ? 'green' : 'gray'">{{ row.active ? 'Active' : 'Inactive' }}</UBadge>
        </template>
      </UTable>
    </div>

    <!-- Mobile Cards -->
    <div class="mobile-cards-container">
      <div v-if="loading" class="loading-state">
        <UIcon name="i-heroicons-arrow-path-20-solid" class="spinner" />
        <span>Loading...</span>
      </div>
      <div v-else-if="rules.length === 0" class="empty-state">
        No recurring rules found.
      </div>
      <div v-for="rule in rules" v-else :key="rule.id" class="mobile-card">
        <div class="card-header">
          <div>
            <div class="card-title">{{ rule.description }}</div>
            <div class="card-meta">{{ rule.category }} • {{ rule.frequency }}</div>
          </div>
          <div class="card-amount">
            {{ formatCurrency(rule.amount) }}
          </div>
        </div>

        <div class="card-footer">
          <div class="card-status">
            <span class="status-label">Next Due:</span> {{ rule.next_due_date }}
            <UBadge :color="rule.active ? 'green' : 'gray'" size="xs" class="status-badge">
              {{ rule.active ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
          <div class="card-actions">
             <UButton color="gray" variant="ghost" icon="i-heroicons-pencil-square-20-solid" @click="openModal(rule)" />
             <UButton color="red" variant="ghost" icon="i-heroicons-trash-20-solid" @click="deleteRule(rule.id)" />
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="section-title modal-header-title">{{ editingId ? 'Edit Rule' : 'Add Rule' }}</h3>
        </template>

        <UForm class="form-content" :state="formData" @submit="saveRule">
          <UFormGroup label="Description" name="description" required>
            <UInput v-model="formData.description" />
          </UFormGroup>

          <UFormGroup label="Category" name="category" required>
             <USelectMenu v-model="formData.category" :options="categories" searchable creatable class="form-input" />
          </UFormGroup>

          <UFormGroup label="Amount" name="amount" required>
            <UInput v-model.number="formData.amount" type="number" step="0.01" />
          </UFormGroup>

          <UFormGroup label="Frequency" name="frequency" required>
            <USelectMenu v-model="formData.frequency" :options="['weekly', 'monthly', 'yearly']" class="form-input" />
          </UFormGroup>

          <UFormGroup label="Next Due Date" name="next_due_date" required>
            <UInput v-model="formData.next_due_date" type="date" />
          </UFormGroup>

          <UFormGroup label="Active" name="active">
            <UToggle v-model="formData.active" />
          </UFormGroup>

          <div class="form-actions">
            <UButton color="gray" variant="ghost" @click="isModalOpen = false">Cancel</UButton>
            <UButton type="submit" color="primary">Save</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(false);
const processing = ref(false);
const rules = ref<any[]>([]);
const isModalOpen = ref(false);
const editingId = ref<number | null>(null);

const formData = ref({
  description: '',
  category: '',
  amount: 0,
  frequency: 'monthly',
  next_due_date: new Date().toISOString().split('T')[0],
  active: true
});

const columns = [
  { key: 'description', label: 'Description' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'next_due_date', label: 'Next Due' },
  { key: 'active', label: 'Status' },
  { key: 'actions', label: '' }
];

const categories = ref([]);

const fetchRules = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/recurring');
    rules.value = data as any[];
  } catch (_e) {
    useToast().add({ title: 'Error fetching rules', color: 'red' });
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const data = await $fetch<any[]>('/api/categories');
    categories.value = data.map((c: any) => c.name) as any;
  } catch (_) {
    // Silent fail
  }
};

onMounted(() => {
  fetchRules();
  fetchCategories();
});

const actions = (row: any) => [[
  { label: 'Edit', icon: 'i-heroicons-pencil-square', click: () => openModal(row) },
  { label: 'Delete', icon: 'i-heroicons-trash', click: () => deleteRule(row.id) }
]];

const openModal = (row: any = null) => {
  if (row) {
    editingId.value = row.id;
    formData.value = { ...row };
  } else {
    editingId.value = null;
    formData.value = {
      description: '',
      category: '',
      amount: 0,
      frequency: 'monthly',
      next_due_date: new Date().toISOString().split('T')[0],
      active: true
    };
  }
  isModalOpen.value = true;
};

const saveRule = async () => {
  try {
    if (editingId.value) {
      await $fetch(`/api/recurring/${editingId.value}`, {
        method: 'PUT',
        body: formData.value
      });
    } else {
      await $fetch('/api/recurring', {
        method: 'POST',
        body: formData.value
      });
    }
    isModalOpen.value = false;
    fetchRules();
    useToast().add({ title: 'Rule saved', color: 'green' });
  } catch (_e) {
    useToast().add({ title: 'Error saving rule', color: 'red' });
  }
};

const deleteRule = async (id: number) => {
  if (!confirm('Are you sure?')) return;
  try {
    await $fetch(`/api/recurring/${id}`, { method: 'DELETE' });
    fetchRules();
    useToast().add({ title: 'Rule deleted', color: 'green' });
  } catch (_e) {
    useToast().add({ title: 'Error deleting rule', color: 'red' });
  }
};

const processRules = async () => {
  processing.value = true;
  try {
    const res = await $fetch<any>('/api/recurring/process', { method: 'POST' });
    useToast().add({ title: `Processed ${res.processed} expenses`, color: 'green' });
    fetchRules(); // Refresh to see updated due dates
  } catch (_e) {
    useToast().add({ title: 'Error processing rules', color: 'red' });
  } finally {
    processing.value = false;
  }
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
</script>

<style scoped>
.recurring-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions-group {
  display: flex;
  gap: 0.5rem;
}

.desktop-label {
  display: none;
}

@media (min-width: 640px) {
  .desktop-label {
    display: inline;
  }
}

.mobile-label {
  display: inline;
}

@media (min-width: 640px) {
  .mobile-label {
    display: none;
  }
}

.desktop-table-container {
  display: none;
}

@media (min-width: 768px) {
  .desktop-table-container {
    display: block;
  }
}

.mobile-cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .mobile-cards-container {
    display: none;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: 2rem 0;
}

.mobile-card {
  padding: 1rem;
  background-color: var(--color-bg-card);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-border-card);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.card-title {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-text-body);
}

.card-meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.card-amount {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-text-body);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.card-status {
  font-size: 0.875rem;
  color: var(--color-text-body);
}

.status-label {
  color: var(--color-text-muted);
}

.status-badge {
  margin-left: 0.5rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.modal-header-title {
  margin-bottom: 0;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
