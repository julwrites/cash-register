<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <UCard :ui="{ body: { padding: 'px-4 py-5 sm:p-6' } }">
      <div class="text-center">
        <div class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Income</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400 min-h-[32px] flex items-center justify-center">
          <USkeleton v-if="loading" class="h-8 w-24" />
          <span v-else>{{ formatCurrency(income) }}</span>
        </div>
      </div>
    </UCard>

    <UCard :ui="{ body: { padding: 'px-4 py-5 sm:p-6' } }">
      <div class="text-center">
        <div class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Expenses</div>
        <div class="text-2xl font-bold text-red-600 dark:text-red-400 min-h-[32px] flex items-center justify-center">
          <USkeleton v-if="loading" class="h-8 w-24" />
          <span v-else>{{ formatCurrency(expenses) }}</span>
        </div>
      </div>
    </UCard>

    <UCard :ui="{ body: { padding: 'px-4 py-5 sm:p-6' } }">
      <div class="text-center">
        <div class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Net Balance</div>
        <div
          class="text-2xl font-bold min-h-[32px] flex items-center justify-center"
          :class="balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'"
        >
          <USkeleton v-if="loading" class="h-8 w-24" />
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
