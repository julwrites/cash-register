<template>
  <div class="dashboard-container">
    <h3 class="page-title">Dashboard</h3>

    <!-- Filters -->
    <div class="filters-section">
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

    <!-- Summary Cards -->
    <div class="summary-section">
      <SummaryCards
        v-if="summary"
        :income="summary.income"
        :expenses="summary.expenses"
        :loading="loading"
      />
    </div>

    <!-- Charts -->
    <div v-if="summary" class="charts-grid">
      <UCard>
        <IncomeExpenseChart v-if="incomeExpenseData" :chart-data="incomeExpenseData" />
      </UCard>
      <UCard>
        <ExpensesByCategoryChart v-if="categoryData" :chart-data="categoryData" />
      </UCard>
    </div>

    <EditExpenseModal
      v-model:is-open="isEditModalOpen"
      :expense="editForm"
      :categories="categories"
      @save="handleSave"
      @cancel="cancelEditing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useExpenses } from '@/composables/useExpenses';
import { useCategories } from '@/composables/useCategories';
import { useThemeColors } from '@/composables/useThemeColors';
import EditExpenseModal from '@/components/EditExpenseModal.vue';
import IncomeExpenseChart from '@/components/IncomeExpenseChart.vue';
import ExpensesByCategoryChart from '@/components/ExpensesByCategoryChart.vue';
import SummaryCards from '@/components/SummaryCards.vue';
import ExpenseFilters from '@/components/ExpenseFilters.vue';

const { fetchExpenseSummary, expenseSummary, loading, updateExpense } = useExpenses();
const { categoriesByName, fetchCategories } = useCategories();
const { colors, palette } = useThemeColors();
const toast = useToast();

const summary = computed(() => expenseSummary.value);
const categories = computed(() => categoriesByName.value);

// Filter variables
const selectedPeriod = ref({ label: 'This Month', value: 'month' });
const selectedCategory = ref({ label: 'All Categories', value: '' });
const startDate = ref<string | null>(null);
const endDate = ref<string | null>(null);

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

const incomeExpenseData = computed(() => {
  if (!summary.value) return null;
  return {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        backgroundColor: [colors.value.success, colors.value.danger],
        data: [summary.value.income, summary.value.expenses]
      }
    ]
  };
});

const categoryData = computed(() => {
  if (!summary.value || !summary.value.byCategory) return null;
  const categories = Object.keys(summary.value.byCategory);
  const data = Object.values(summary.value.byCategory);

  return {
    labels: categories,
    datasets: [
      {
        backgroundColor: palette.value.slice(0, categories.length),
        data: data
      }
    ]
  };
});

const isEditModalOpen = ref(false);
const editForm = ref({});

// Watchers for filters
watch([selectedPeriod, selectedCategory, startDate, endDate], () => {
  refreshData();
});

function resetFilters() {
  selectedPeriod.value = { label: 'All Time', value: '' };
  selectedCategory.value = { label: 'All Categories', value: '' };
  startDate.value = null;
  endDate.value = null;
}

function formatCurrency(amount: number | string) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}


function startEditing(expense: any) {
  editForm.value = { ...expense };
  isEditModalOpen.value = true;
}

function cancelEditing() {
  isEditModalOpen.value = false;
  editForm.value = {};
}

async function handleSave(updatedExpense: any) {
  try {
    await updateExpense(updatedExpense);
    isEditModalOpen.value = false;
    toast.add({
      title: 'Success',
      description: 'Expense updated successfully.',
      color: 'green'
    });
    // Refresh data
    refreshData();
  } catch (_e) {
    toast.add({
      title: 'Error',
      description: 'Failed to update expense.',
      color: 'red'
    });
  }
}

async function refreshData() {
  const filters = currentFilters.value;
  await fetchExpenseSummary(filters);
}

onMounted(async () => {
  await fetchCategories();
  await refreshData();
});
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.summary-section {
  margin-bottom: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.filters-section {
  margin-bottom: 1.5rem;
}
</style>
