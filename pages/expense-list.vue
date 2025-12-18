<template>
  <div class="expense-list-container">
    <div class="flex justify-between items-center mb-6">
      <h3 class="page-title mb-0">Past Records</h3>

      <!-- View Mode Toggle -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">View Mode:</span>
        <UButtonGroup size="sm" orientation="horizontal">
          <UButton
            :color="viewMode === 'recent' ? 'primary' : 'gray'"
            variant="solid"
            label="Recent"
            @click="viewMode = 'recent'"
          />
          <UButton
            :color="viewMode === 'all' ? 'primary' : 'gray'"
            variant="solid"
            label="All"
            @click="viewMode = 'all'"
          />
        </UButtonGroup>
      </div>
    </div>

    <!-- Filters (Only visible in 'All' mode) -->
    <div v-if="viewMode === 'all'" class="mb-6">
      <ExpenseFilters
        :selected-period="selectedPeriod"
        :selected-category="selectedCategory"
        :category-options="categoryOptions"
        :start-date="startDate"
        :end-date="endDate"
        @update:selected-period="selectedPeriod = $event"
        @update:selected-category="selectedCategory = $event"
        @update:start-date="startDate = $event"
        @update:end-date="endDate = $event"
        @reset-filters="resetFilters"
      />
    </div>
    <div v-else class="mb-4 text-sm text-gray-500 italic">
      Showing the 10 most recent transactions for quick editing. Switch to "All" to search and filter.
    </div>

    <div>
      <ExpenseTable
        :entries="paginatedExpenses"
        :columns="columns"
        :loading="loading"
        @edit="startEditing"
        @delete="confirmDelete"
      />

      <!-- Pagination (Only visible in 'All' mode) -->
      <UPagination
        v-if="viewMode === 'all' && totalCount > 0"
        v-model="currentPage"
        :total="totalCount"
        :per-page="itemsPerPage"
        class="mt-4 justify-center"
        @change="handlePageChange"
      />
    </div>

    <EditExpenseModal
      v-model:is-open="isEditModalOpen"
      :expense="editForm"
      :categories="categories"
      @save="handleSave"
      @cancel="cancelEditing"
    />

    <UModal v-model="isDeleteModalOpen">
      <div class="p-4">
        <h3 class="text-lg font-bold mb-2">Confirm Delete</h3>
        <p class="mb-4">Are you sure you want to delete this expense?</p>
        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="ghost" @click="isDeleteModalOpen = false">Cancel</UButton>
          <UButton color="red" @click="executeDelete">Delete</UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useExpenses } from '@/composables/useExpenses';
import { useCategories } from '@/composables/useCategories';
import ExpenseFilters from '@/components/ExpenseFilters.vue';
import ExpenseTable from '@/components/ExpenseTable.vue';
import EditExpenseModal from '@/components/EditExpenseModal.vue';

const {
  paginatedExpenses,
  totalCount,
  loading,
  fetchPaginatedExpenses,
  updateExpense,
  deleteExpense: apiDeleteExpense,
} = useExpenses();

const { categoriesByName, fetchCategories } = useCategories();
const toast = useToast();

// Reactive variables
const viewMode = ref<'recent' | 'all'>('recent');

const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const expenseToDeleteId = ref<number | null>(null);
const editForm = ref({});
const currentPage = ref(1);
const itemsPerPage = 10;

const startDate = ref(null);
const endDate = ref(null);

const selectedPeriod = ref({ label: 'This Month', value: 'month' });
const selectedCategory = ref({ label: 'All Categories', value: '' });

// Constants
const columns = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: 'Actions' },
];

// Computed properties
const categories = computed(() => categoriesByName.value);

const categoryOptions = computed(() => [
  { label: 'All Categories', value: '' },
  ...categoriesByName.value.map((cat) => ({
    label: cat.name,
    value: cat.name,
  })),
]);

// Helper to convert selected filters into query params
const currentFilters = computed(() => {
  const filters: any = {};
  if (selectedCategory.value.value) {
    filters.category = selectedCategory.value.value;
  }

  if (selectedPeriod.value.value) {
    const now = new Date();
    const filterStartDate = new Date(now);
    const filterEndDate = new Date(now);

    if (selectedPeriod.value.value === 'week') {
      filterStartDate.setDate(now.getDate() - now.getDay());
      filterStartDate.setHours(0, 0, 0, 0);
      filterEndDate.setHours(23, 59, 59, 999);
      filters.startDate = filterStartDate.toISOString().split('T')[0];
      filters.endDate = filterEndDate.toISOString().split('T')[0];
    } else if (selectedPeriod.value.value === 'month') {
      filterStartDate.setDate(1);
      filterStartDate.setHours(0, 0, 0, 0);
      filterEndDate.setMonth(now.getMonth() + 1, 0);
      filterEndDate.setHours(23, 59, 59, 999);
      filters.startDate = filterStartDate.toISOString().split('T')[0];
      filters.endDate = filterEndDate.toISOString().split('T')[0];
    } else if (selectedPeriod.value.value === 'year') {
      filterStartDate.setMonth(0, 1);
      filterStartDate.setHours(0, 0, 0, 0);
      filterEndDate.setMonth(11, 31);
      filterEndDate.setHours(23, 59, 59, 999);
      filters.startDate = filterStartDate.toISOString().split('T')[0];
      filters.endDate = filterEndDate.toISOString().split('T')[0];
    } else if (
      selectedPeriod.value.value === 'custom' &&
      startDate.value &&
      endDate.value
    ) {
      // Use provided start/end date
      filters.startDate = startDate.value;
      filters.endDate = endDate.value;
    }
  }

  return filters;
});

// Watchers
watch([selectedPeriod, selectedCategory, startDate, endDate], () => {
  if (viewMode.value === 'all') {
    currentPage.value = 1;
    refreshData();
  }
});

watch(viewMode, (_newMode) => {
  currentPage.value = 1; // Reset page on mode switch
  refreshData();
});

// Lifecycle hooks
onMounted(async () => {
  await fetchCategories();
  await refreshData();
});

// Functions
async function refreshData() {
  try {
    if (viewMode.value === 'recent') {
      // Recent Mode: Force sort by date desc, no filters, limit 10
      await fetchPaginatedExpenses({
        page: 1,
        limit: 10,
        sort: 'date',
        order: 'desc'
      });
    } else {
      // All Mode: Use user selected filters
      const filters = currentFilters.value;
      await fetchPaginatedExpenses({
        page: currentPage.value,
        limit: itemsPerPage,
        ...filters,
      });
    }
  } catch (_e) {
    toast.add({
      title: 'Error',
      description: 'Failed to load expenses.',
      color: 'red'
    });
  }
}

function resetFilters() {
  selectedPeriod.value = { label: 'All Time', value: '' };
  selectedCategory.value = { label: 'All Categories', value: '' };
  startDate.value = null;
  endDate.value = null;
  currentPage.value = 1;
  // Watcher will trigger refreshData
}

function handlePageChange(page: number) {
  currentPage.value = page;

  if (viewMode.value === 'all') {
      const filters = currentFilters.value;
      fetchPaginatedExpenses({
        page: currentPage.value,
        limit: itemsPerPage,
        ...filters,
      }).catch(() => {
          toast.add({
          title: 'Error',
          description: 'Failed to load page.',
          color: 'red'
        });
      });
  }
}

function cancelEditing() {
  isEditModalOpen.value = false;
  editForm.value = {};
}

async function handleSave(updatedExpense: Expense) {
  try {
    await updateExpense(updatedExpense);
    isEditModalOpen.value = false;
    toast.add({
      title: 'Success',
      description: 'Expense updated successfully.',
      color: 'green'
    });
    // Refresh to show updated data
    refreshData();
  } catch (_e) {
    toast.add({
      title: 'Error',
      description: 'Failed to update expense.',
      color: 'red'
    });
  }
}

function startEditing(row: any) {
  // Find in paginated list
  const expense = paginatedExpenses.value.find((e) => e.id === row.id);

  if (expense) {
    editForm.value = { ...expense };
    isEditModalOpen.value = true;
  }
}

function confirmDelete(id: number) {
  expenseToDeleteId.value = id;
  isDeleteModalOpen.value = true;
}

async function executeDelete() {
  if (expenseToDeleteId.value !== null) {
    try {
      await apiDeleteExpense(expenseToDeleteId.value);
      isDeleteModalOpen.value = false;
      toast.add({
        title: 'Success',
        description: 'Expense deleted successfully.',
        color: 'green'
      });
      refreshData();
    } catch (_e) {
      toast.add({
        title: 'Error',
        description: 'Failed to delete expense.',
        color: 'red'
      });
    } finally {
      expenseToDeleteId.value = null;
    }
  }
}
</script>

<style scoped>
.expense-list-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
}

:deep(.expense-table) {
  min-width: 100%;
  width: max-content;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

:deep(th),
:deep(td) {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(th) {
  background-color: var(--color-background-subtle);
  font-weight: bold;
}

:deep(tr:hover) {
  background-color: var(--color-background-hover);
  transition: background-color 0.3s ease;
}

/* Define specific widths for each column */
:deep(th:nth-child(1)),
:deep(td:nth-child(1)) {
  width: 100px;
}
:deep(th:nth-child(2)),
:deep(td:nth-child(2)) {
  width: 150px;
}
:deep(th:nth-child(3)),
:deep(td:nth-child(3)) {
  width: 300px;
}
:deep(th:nth-child(4)),
:deep(td:nth-child(4)) {
  width: 100px;
}
:deep(th:nth-child(5)),
:deep(td:nth-child(5)) {
  width: 100px;
}

:root {
  --color-border-subtle: #e2e8f0;
  --color-background-subtle: #f8fafc;
  --color-background-hover: #f1f5f9;
}

:root.dark {
  --color-border-subtle: #2d3748;
  --color-background-subtle: #1a202c;
  --color-background-hover: #2d3748;
}

@media (max-width: 1024px) {
  .expense-list-container {
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .expense-list-container {
    padding: 5px;
  }
  :deep(th),
  :deep(td) {
    padding: 6px;
  }
}

@media (max-width: 640px) {
  .expense-list-container {
    padding: 2px;
  }
  :deep(th),
  :deep(td) {
    padding: 4px;
  }
}
</style>
