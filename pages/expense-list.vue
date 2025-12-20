<template>
  <div class="expense-list-container">
    <div class="header-row">
      <h3 class="page-title">Past Records</h3>

      <!-- View Mode Toggle -->
      <div class="view-mode-group">
        <span class="view-mode-label">View Mode:</span>
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
    <div v-if="viewMode === 'all'" class="filters-section">
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

      <div class="summary-cards-wrapper">
        <SummaryCards
          v-if="expenseSummary"
          :income="expenseSummary.income"
          :expenses="expenseSummary.expenses"
          :loading="loading"
        />
      </div>
    </div>
    <div v-else class="recent-mode-hint">
      Showing the 10 most recent transactions for quick editing. Switch to "All" to search, filter, and sort.
    </div>

    <div>
      <ExpenseTable
        v-model:sort="sort"
        :entries="paginatedExpenses"
        :columns="columns"
        :loading="loading"
        @edit="startEditing"
        @delete="confirmDelete"
      />

      <!-- Pagination (Only visible in 'All' mode) -->
      <div v-if="viewMode === 'all' && totalCount > 0" class="pagination-wrapper">
        <UPagination
          v-model="currentPage"
          :total="totalCount"
          :per-page="itemsPerPage"
          @change="handlePageChange"
        />
      </div>
    </div>

    <EditExpenseModal
      v-model:is-open="isEditModalOpen"
      :expense="editForm"
      :categories="categories"
      @save="handleSave"
      @cancel="cancelEditing"
    />

    <UModal v-model="isDeleteModalOpen">
      <div class="modal-body">
        <h3 class="modal-title">Confirm Delete</h3>
        <p class="modal-text">Are you sure you want to delete this expense?</p>
        <div class="modal-actions">
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
import SummaryCards from '@/components/SummaryCards.vue';

const {
  paginatedExpenses,
  totalCount,
  loading,
  fetchPaginatedExpenses,
  fetchExpenseSummary,
  expenseSummary,
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

const sort = ref({ column: 'date', direction: 'desc' as const });

// Computed properties
const columns = computed(() => [
  { key: 'date', label: 'Date', sortable: viewMode.value === 'all' },
  { key: 'category', label: 'Category', sortable: viewMode.value === 'all' },
  { key: 'description', label: 'Description', sortable: viewMode.value === 'all' },
  { key: 'amount', label: 'Amount', sortable: viewMode.value === 'all' },
  { key: 'actions', label: 'Actions' },
]);

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

watch(viewMode, (newMode) => {
  if (newMode === 'recent') {
      sort.value = { column: 'date', direction: 'desc' };
  }
  currentPage.value = 1; // Reset page on mode switch
  refreshData();
});

watch(sort, () => {
    if (viewMode.value === 'all') {
        refreshData();
    }
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
        sortBy: 'date',
        sortOrder: 'desc'
      });
    } else {
      // All Mode: Use user selected filters
      const filters = currentFilters.value;
      await Promise.all([
        fetchPaginatedExpenses({
          page: currentPage.value,
          limit: itemsPerPage,
          ...filters,
          sortBy: sort.value.column,
          sortOrder: sort.value.direction,
        }),
        fetchExpenseSummary({
          ...filters
        })
      ]);
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
  sort.value = { column: 'date', direction: 'desc' };
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
        sortBy: sort.value.column,
        sortOrder: sort.value.direction,
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

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #111827; /* gray-900 */
}

:global(.dark) .page-title {
  color: white;
}

.view-mode-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-mode-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563; /* gray-600 */
}

:global(.dark) .view-mode-label {
  color: #9ca3af; /* gray-400 */
}

.filters-section {
  margin-bottom: 1.5rem;
}

.summary-cards-wrapper {
  margin-top: 1.5rem;
}

.recent-mode-hint {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280; /* gray-500 */
  font-style: italic;
}

.pagination-wrapper {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.modal-body {
  padding: 1rem;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.modal-text {
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
