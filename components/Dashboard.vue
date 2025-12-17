<template>
  <div class="dashboard-container">
    <h3 class="text-xl font-bold mb-4">Dashboard</h3>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <UCard>
        <div class="text-center">
          <div class="text-gray-500 text-sm font-medium">Income (This Month)</div>
          <div class="text-2xl font-bold text-green-600">
            {{ formatCurrency(summary?.income || 0) }}
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="text-gray-500 text-sm font-medium">Expenses (This Month)</div>
          <div class="text-2xl font-bold text-red-600">
            {{ formatCurrency(summary?.expenses || 0) }}
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="text-gray-500 text-sm font-medium">Balance (This Month)</div>
          <div class="text-2xl font-bold" :class="(summary?.income || 0) - (summary?.expenses || 0) >= 0 ? 'text-blue-600' : 'text-red-600'">
            {{ formatCurrency((summary?.income || 0) - (summary?.expenses || 0)) }}
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Transactions -->
    <h4 class="text-lg font-bold mb-2">Recent Transactions</h4>
    <div v-if="loading" class="flex justify-center p-4">
      <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin w-6 h-6 mr-2" />
      <span>Loading...</span>
    </div>
    <div v-else-if="recentExpenses.length === 0" class="text-gray-500 text-center p-4">
      No recent transactions found.
    </div>
    <div v-else class="recent-list bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div
        v-for="expense in recentExpenses"
        :key="expense.id"
        class="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        @click="startEditing(expense)"
      >
        <div>
          <div class="font-medium">{{ expense.description }}</div>
          <div class="text-sm text-gray-500">{{ formatDate(expense.date) }} • {{ expense.category }}</div>
        </div>
        <div class="font-bold" :class="expense.amount < 0 ? 'text-red-500' : 'text-green-500'">
          {{ formatCurrency(expense.amount) }}
        </div>
      </div>
    </div>

    <div class="mt-4 text-center">
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

const { fetchPaginatedExpenses, fetchExpenseSummary, expenseSummary, paginatedExpenses, loading, updateExpense } = useExpenses();
const { categoriesByName, fetchCategories } = useCategories();
const toast = useToast();

const summary = computed(() => expenseSummary.value);
const recentExpenses = computed(() => paginatedExpenses.value);
const categories = computed(() => categoriesByName.value);

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
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}
</style>
