<template>
  <div class="dashboard-container">
    <h3 class="dashboard-title">Dashboard</h3>

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

    <!-- Recent Transactions -->
    <h4 class="recent-title">Recent Transactions</h4>
    <div v-if="loading" class="loading-container">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="spinner" />
      <span>Loading...</span>
    </div>
    <div v-else-if="recentExpenses.length === 0" class="no-data">
      No recent transactions found.
    </div>
    <div v-else class="recent-list">
      <div
        v-for="expense in recentExpenses"
        :key="expense.id"
        class="transaction-item"
        @click="startEditing(expense)"
      >
        <div class="transaction-info">
          <div class="transaction-desc">{{ expense.description }}</div>
          <div class="transaction-meta">{{ formatDate(expense.date) }} • {{ expense.category }}</div>
        </div>
        <div class="transaction-amount" :class="expense.amount < 0 ? 'amount-negative' : 'amount-positive'">
          {{ formatCurrency(expense.amount) }}
        </div>
      </div>
    </div>

    <div class="view-all-container">
      <UButton variant="link" @click="$emit('view-all')">View All Transactions</UButton>
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
import { ref, onMounted, computed } from 'vue';
import { useExpenses } from '@/composables/useExpenses';
import { useCategories } from '@/composables/useCategories';
import EditExpenseModal from '@/components/EditExpenseModal.vue';
import IncomeExpenseChart from '@/components/IncomeExpenseChart.vue';
import ExpensesByCategoryChart from '@/components/ExpensesByCategoryChart.vue';
import SummaryCards from '@/components/SummaryCards.vue';

const { fetchPaginatedExpenses, fetchExpenseSummary, expenseSummary, paginatedExpenses, loading, updateExpense } = useExpenses();
const { categoriesByName, fetchCategories } = useCategories();
const toast = useToast();

const summary = computed(() => expenseSummary.value);
const recentExpenses = computed(() => paginatedExpenses.value);
const categories = computed(() => categoriesByName.value);

const incomeExpenseData = computed(() => {
  if (!summary.value) return null;
  return {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount',
        backgroundColor: ['#10B981', '#EF4444'],
        data: [summary.value.income, summary.value.expenses]
      }
    ]
  };
});

const categoryData = computed(() => {
  if (!summary.value || !summary.value.byCategory) return null;
  const categories = Object.keys(summary.value.byCategory);
  const data = Object.values(summary.value.byCategory);

  // Need colors for categories
  const backgroundColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6',
    '#0EA5E9', '#22C55E', '#EAB308', '#818CF8', '#D946EF', '#A855F7'
  ];

  return {
    labels: categories,
    datasets: [
      {
        backgroundColor: backgroundColors.slice(0, categories.length),
        data: data
      }
    ]
  };
});

const isEditModalOpen = ref(false);
const editForm = ref({});

defineEmits(['view-all']);

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
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
    // Re-fetch recent expenses to update the list
    await fetchPaginatedExpenses({
        page: 1,
        limit: 5,
        sort: 'date',
        order: 'desc'
    });

    // Also re-fetch summary as amount might have changed
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    await fetchExpenseSummary({
        startDate,
        endDate,
        period: 'month'
    });
}

onMounted(async () => {
  await fetchCategories();

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  // Fetch summary for this month
  await fetchExpenseSummary({
    startDate,
    endDate,
    period: 'month'
  });

  // Fetch recent 5 expenses
  await fetchPaginatedExpenses({
    page: 1,
    limit: 5,
    sort: 'date',
    order: 'desc'
  });
});
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.dashboard-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.summary-section {
  margin-bottom: 2rem;
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

.recent-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.loading-container {
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

.no-data {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-muted);
}

.recent-list {
  background-color: var(--color-bg-card);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

:global(.dark) .recent-list {
  /* Handled by vars */
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.2s;
}

:global(.dark) .transaction-item {
  /* Handled by vars */
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item:hover {
  background-color: var(--color-bg-hover);
}

:global(.dark) .transaction-item:hover {
  /* Handled by vars */
}

.transaction-info {
  /* container for text */
}

.transaction-desc {
  font-weight: 500;
}

.transaction-meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

:global(.dark) .transaction-meta {
  /* Handled by vars */
}

.transaction-amount {
  font-weight: 700;
}

.amount-negative {
  color: var(--color-danger);
}

.amount-positive {
  color: var(--color-success);
}

.view-all-container {
  margin-top: 1rem;
  text-align: center;
}
</style>
