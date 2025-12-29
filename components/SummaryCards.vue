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
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .summary-grid {
    gap: 0.25rem;
  }
}

.summary-card {
  /* Reduce card padding */
}

:deep(.u-card-body) {
  padding: 0.75rem !important;
}

@media (max-width: 640px) {
  :deep(.u-card-body) {
    padding: 0.5rem !important;
  }
}

.card-content {
  text-align: center;
}

.card-label {
  color: var(--color-text-muted);
  font-size: 0.75rem; /* Smaller on all screens */
  font-weight: 500;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .card-label {
    font-size: 0.875rem; /* Slightly larger on desktop */
  }
}

.card-value-container {
  font-size: 1rem; /* Smaller font size */
  font-weight: 700;
  min-height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .card-value-container {
    font-size: 1.25rem; /* Slightly larger on desktop */
  }
}

.income-value {
  color: var(--color-success);
}

.expense-value {
  color: var(--color-danger);
}

.balance-positive {
  color: var(--color-primary);
}

.balance-negative {
  color: var(--color-danger);
}

.skeleton {
  height: 1.5rem;
  width: 4rem;
}

@media (min-width: 768px) {
  .skeleton {
    height: 1.75rem;
    width: 5rem;
  }
}
</style>
