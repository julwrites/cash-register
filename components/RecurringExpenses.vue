<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold">Recurring Expenses</h2>
      <div class="space-x-2">
        <UButton :loading="processing" icon="i-heroicons-arrow-path" color="gray" @click="processRules">
          <span class="hidden sm:inline">Process Now</span>
        </UButton>
        <UButton icon="i-heroicons-plus" @click="openModal()">
          <span class="hidden sm:inline">Add Rule</span>
          <span class="sm:hidden">Add</span>
        </UButton>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block">
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
    <div class="md:hidden space-y-4">
      <div v-if="loading" class="flex justify-center p-4">
        <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin w-6 h-6 mr-2" />
        <span>Loading...</span>
      </div>
      <div v-else-if="rules.length === 0" class="text-center text-gray-500 py-8">
        No recurring rules found.
      </div>
      <div v-for="rule in rules" v-else :key="rule.id" class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-start mb-2">
          <div>
            <div class="font-bold text-lg">{{ rule.description }}</div>
            <div class="text-sm text-gray-500">{{ rule.category }} • {{ rule.frequency }}</div>
          </div>
          <div class="font-bold text-lg">
            {{ formatCurrency(rule.amount) }}
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <div class="text-sm">
            <span class="text-gray-500">Next Due:</span> {{ rule.next_due_date }}
            <UBadge :color="rule.active ? 'green' : 'gray'" size="xs" class="ml-2">
              {{ rule.active ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
          <div class="flex gap-2">
             <UButton color="gray" variant="ghost" icon="i-heroicons-pencil-square-20-solid" @click="openModal(rule)" />
             <UButton color="red" variant="ghost" icon="i-heroicons-trash-20-solid" @click="deleteRule(rule.id)" />
          </div>
        </div>
      </div>
    </div>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="font-semibold">{{ editingId ? 'Edit Rule' : 'Add Rule' }}</h3>
        </template>

        <UForm class="space-y-4" :state="formData" @submit="saveRule">
          <UFormGroup label="Description" name="description" required>
            <UInput v-model="formData.description" />
          </UFormGroup>

          <UFormGroup label="Category" name="category" required>
             <USelectMenu v-model="formData.category" :options="categories" searchable creatable />
          </UFormGroup>

          <UFormGroup label="Amount" name="amount" required>
            <UInput v-model.number="formData.amount" type="number" step="0.01" />
          </UFormGroup>

          <UFormGroup label="Frequency" name="frequency" required>
            <USelectMenu v-model="formData.frequency" :options="['weekly', 'monthly', 'yearly']" />
          </UFormGroup>

          <UFormGroup label="Next Due Date" name="next_due_date" required>
            <UInput v-model="formData.next_due_date" type="date" />
          </UFormGroup>

          <UFormGroup label="Active" name="active">
            <UToggle v-model="formData.active" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
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
