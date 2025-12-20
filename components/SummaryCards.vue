<template>
  <div class="summary-grid">
    <UCard class="summary-card">
      <div class="card-content">
        <div class="card-label">Total Income</div>
        <div class="card-value-container income-value">
          <USkeleton v-if="loading" class="skeleton" />
          <span v-else>{{ formatCurrency(income) }}</span>
        </div>
      </div>
    </UCard>

    <UCard class="summary-card">
      <div class="card-content">
        <div class="card-label">Total Expenses</div>
        <div class="card-value-container expense-value">
          <USkeleton v-if="loading" class="skeleton" />
          <span v-else>{{ formatCurrency(expenses) }}</span>
        </div>
      </div>
    </UCard>

    <UCard class="summary-card">
      <div class="card-content">
        <div class="card-label">Net Balance</div>
        <div
          class="card-value-container"
          :class="balance >= 0 ? 'balance-positive' : 'balance-negative'"
        >
          <USkeleton v-if="loading" class="skeleton" />
          <span v-else>{{ formatCurrency(balance) }}</span>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  income: number;
  expenses: number;
  loading?: boolean;
}>();

const balance = computed(() => props.income - props.expenses);

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.summary-card {
  /* You can target UCard specific parts via deep selectors if needed,
     but defaults are usually fine. */
}

/* Optional: Override UCard padding if it's too much/little */
/*
:deep(.u-card-body) {
  padding: 1.25rem;
}
*/

.card-content {
  text-align: center;
}

.card-label {
  color: #6b7280; /* gray-500 */
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

:global(.dark) .card-label {
  color: #9ca3af; /* gray-400 */
}

.card-value-container {
  font-size: 1.5rem; /* text-2xl */
  font-weight: 700;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.income-value {
  color: #16a34a; /* green-600 */
}

:global(.dark) .income-value {
  color: #4ade80; /* green-400 */
}

.expense-value {
  color: #dc2626; /* red-600 */
}

:global(.dark) .expense-value {
  color: #f87171; /* red-400 */
}

.balance-positive {
  color: #2563eb; /* blue-600 */
}

:global(.dark) .balance-positive {
  color: #60a5fa; /* blue-400 */
}

.balance-negative {
  color: #dc2626; /* red-600 */
}

:global(.dark) .balance-negative {
  color: #f87171; /* red-400 */
}

.skeleton {
  height: 2rem;
  width: 6rem;
}
</style>
