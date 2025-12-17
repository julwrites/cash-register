<template>
  <div class="expense-list-container">
    <h3 class="page-title">Past Records</h3>

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

    <div class="mobile-tabs">
      <UTabs :items="tabItems" @change="onTabChange" />
    </div>

    <div v-show="!isMobile || activeTab === 'charts'" class="charts-container">
      <UTabs :items="chartTabItems" @change="onChartTabChange" />
      <div v-if="activeChartTab === 'income-expense'">
        <IncomeExpenseChart :chart-data="barChartData" />
      </div>
      <div v-else-if="activeChartTab === 'category'">
        <ExpensesByCategoryChart :chart-data="pieChartData" />
      </div>
    </div>

    <div v-show="!isMobile || activeTab === 'table'">
      <ExpenseTable
        :entries="paginatedExpenses"
        :columns="columns"
        :loading="loading"
        @edit="startEditing"
        @delete="confirmDelete"
      />

      <UPagination
        v-if="totalCount > 0"
        v-model="currentPage"
        :total="totalCount"
        :per-page="itemsPerPage"
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
import ExpenseFilters from './components/ExpenseFilters.vue';
import IncomeExpenseChart from './components/IncomeExpenseChart.vue';
import ExpensesByCategoryChart from './components/ExpensesByCategoryChart.vue';
import ExpenseTable from './components/ExpenseTable.vue';
import EditExpenseModal from '@/components/EditExpenseModal.vue';

const {
  paginatedExpenses,
  totalCount,
  expenseSummary,
  loading,
  fetchPaginatedExpenses,
  fetchExpenseSummary,
  updateExpense,
  deleteExpense: apiDeleteExpense,
} = useExpenses();

const { categoriesByName, fetchCategories } = useCategories();
const toast = useToast();

// Reactive variables
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

const activeTab = ref('table');
const isMobile = ref(false);
const activeChartTab = ref('income-expense');

// Constants
const columns = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: 'Actions' },
];

const tabItems = [
  { label: 'Table', slot: 'table' },
  { label: 'Charts', slot: 'charts' },
];

const chartTabItems = [
  { label: 'Income vs Expenses', slot: 'income-expense' },
  { label: 'Expenses by Category', slot: 'category' },
];

// Computed properties
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

const barChartData = computed(() => {
  const income = expenseSummary.value?.income || 0;
  const expenses = expenseSummary.value?.expenses || 0;
  return {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        data: [income, expenses],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      },
    ],
  };
});

const pieChartData = computed(() => {
  const expensesByCategory = expenseSummary.value?.byCategory || {};

  return {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };
});

// Watchers
watch([selectedPeriod, selectedCategory, startDate, endDate], () => {
  currentPage.value = 1;
  refreshData();
});

// Lifecycle hooks
onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  await fetchCategories();
  await refreshData();
});

// Functions
async function refreshData() {
  const filters = currentFilters.value;

  try {
    // Fetch paginated data for table
    await fetchPaginatedExpenses({
      page: currentPage.value,
      limit: itemsPerPage,
      ...filters,
    });

    // Fetch aggregated data for charts
    await fetchExpenseSummary({
      ...filters,
    });
  } catch (_e) {
    toast.add({
      title: 'Error',
      description: 'Failed to load expenses.',
      color: 'red'
    });
  }
}

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

function onTabChange(index: number) {
  activeTab.value = tabItems[index].slot;
}

function onChartTabChange(index: number) {
  activeChartTab.value = chartTabItems[index].slot;
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
  // Only refresh paginated data when changing page
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
  margin-bottom: 20px;
  text-align: center;
}

.charts-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  width: 100%;
}

.chart {
  width: 100%;
  height: 300px;
  margin-top: 20px;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.edit-modal {
  max-width: 90vw;
  width: 100%;
  margin: 0 auto;
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

.mobile-tabs {
  display: none;
}

@media (max-width: 1024px) {
  .expense-list-container {
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .mobile-tabs {
    display: block;
    margin-bottom: 20px;
  }

  .charts-container {
    flex-direction: column;
  }
  .chart {
    height: 250px;
    margin-bottom: 30px;
  }
  .expense-list-container {
    padding: 5px;
  }
  :deep(th),
  :deep(td) {
    padding: 6px;
  }
  :deep(.chartjs-render-monitor) {
    max-width: 100%;
    max-height: 100%;
  }
}

@media (max-width: 640px) {
  .expense-list-container {
    padding: 2px;
  }
  .edit-modal {
    max-width: 98vw;
  }
  :deep(th),
  :deep(td) {
    padding: 4px;
  }
}

@media (max-width: 480px) {
  .chart {
    height: 200px;
  }
}
</style>
