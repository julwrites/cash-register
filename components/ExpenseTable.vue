<template>
  <div class="table-container">
    <!-- Desktop Table View -->
    <div class="desktop-view">
      <UTable
        :rows="entries"
        :columns="columns"
        :loading="loading"
        :sort="sort"
        class="expense-table"
        @update:sort="emit('update:sort', $event)"
      >
        <template #loading-state>
          <div class="loading-state">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="spinner" />
            <span>Loading expenses...</span>
          </div>
        </template>

        <template #empty-state>
          <div v-if="!loading" class="empty-state">
            <UIcon name="i-heroicons-clipboard-document-list-20-solid" class="empty-icon" />
            <span>No expenses found for this period.</span>
          </div>
        </template>

        <template #amount-data="{ row }">
          <span :class="getAmountColor(row)">{{ row.amount }}</span>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)" :popper="{ strategy: 'fixed' }">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template>
      </UTable>
    </div>

    <!-- Mobile Card View -->
    <div class="mobile-view">
      <div v-if="loading" class="loading-state">
         <UIcon name="i-heroicons-arrow-path-20-solid" class="spinner" />
         <span>Loading expenses...</span>
      </div>

      <div v-else-if="entries.length === 0" class="empty-state">
         <UIcon name="i-heroicons-clipboard-document-list-20-solid" class="empty-icon" />
         <span>No expenses found for this period.</span>
      </div>

      <template v-else>
        <div v-for="row in entries" :key="row.id" class="mobile-card">
          <div class="mobile-header">
            <span class="mobile-date">{{ row.date }}</span>
            <span :class="['mobile-amount', getAmountColor(row)]">{{ row.amount }}</span>
          </div>

          <div class="mobile-desc">
            {{ row.description }}
          </div>

          <div class="mobile-footer">
            <UBadge color="gray" variant="solid" size="xs">{{ row.category }}</UBadge>
            <div class="mobile-actions">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-pencil-square-20-solid"
                size="sm"
                @click="emit('edit', row)"
              />
              <UButton
                color="red"
                variant="ghost"
                icon="i-heroicons-trash-20-solid"
                size="sm"
                @click="emit('delete', row.id)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  entries: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  sort: {
    type: Object,
    default: undefined,
  }
});

const emit = defineEmits(['edit', 'delete', 'update:sort']);

function actions(row: Record<string, any>) {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => emit('edit', row),
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: () => emit('delete', row.id),
      },
    ],
  ];
}

function getAmountColor(row: Record<string, any>) {
  if (row.credit > 0) return 'amount-positive';
  if (row.debit > 0) return 'amount-negative';
  return 'amount-neutral';
}
</script>

<style scoped>
.table-container {
  width: 100%;
}

.desktop-view {
  display: none;
  overflow-x: auto;
}

@media (min-width: 768px) {
  .desktop-view {
    display: block;
  }
}

.expense-table {
  width: 100%;
}

/* Target internal table cells for styling previously in :ui prop */
:deep(td) {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(th) {
  white-space: nowrap;
}

.loading-state {
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--color-gray-500);
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.5rem;
}

.mobile-view {
  display: block;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .mobile-view {
    display: none;
  }
}

.mobile-card {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-gray-200);
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:global(.dark) .mobile-card {
  border-color: var(--color-gray-700);
  background-color: var(--color-gray-800);
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.mobile-date {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

:global(.dark) .mobile-date {
  color: var(--color-gray-400);
}

.mobile-amount {
  font-weight: 700;
}

.mobile-desc {
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--color-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark) .mobile-desc {
  color: var(--color-gray-100);
}

.mobile-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-actions {
  display: flex;
  gap: 0.5rem;
}

/* Semantic Amount Colors */
.amount-positive {
  color: var(--color-green-600);
}

:global(.dark) .amount-positive {
  color: var(--color-green-400);
}

.amount-negative {
  color: var(--color-red-600);
}

:global(.dark) .amount-negative {
  color: var(--color-red-400);
}

.amount-neutral {
  color: var(--color-gray-900);
}

:global(.dark) .amount-neutral {
  color: var(--color-gray-100);
}
</style>
