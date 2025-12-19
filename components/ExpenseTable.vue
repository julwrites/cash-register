<template>
  <div class="expense-list-wrapper">
    <!-- Desktop Table View -->
    <div class="table-container hidden md:block">
      <UTable
        :rows="entries"
        :columns="columns"
        table-class="expense-table"
        :loading="loading"
        :sort="sort"
        @update:sort="emit('update:sort', $event)"
      >
        <template #loading-state>
          <div class="flex items-center justify-center p-4">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin w-6 h-6 mr-2" />
            <span>Loading expenses...</span>
          </div>
        </template>

        <template #empty-state>
          <div v-if="!loading" class="flex flex-col items-center justify-center p-8 text-gray-500">
            <UIcon name="i-heroicons-clipboard-document-list-20-solid" class="w-12 h-12 mb-2" />
            <span>No expenses found for this period.</span>
          </div>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
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
    <div class="mobile-cards block md:hidden space-y-4">
      <div v-if="loading" class="flex items-center justify-center p-8 text-gray-500">
         <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin w-6 h-6 mr-2" />
         <span>Loading expenses...</span>
      </div>

      <div v-else-if="entries.length === 0" class="flex flex-col items-center justify-center p-8 text-gray-500">
         <UIcon name="i-heroicons-clipboard-document-list-20-solid" class="w-12 h-12 mb-2" />
         <span>No expenses found for this period.</span>
      </div>

      <template v-else>
        <div v-for="row in entries" :key="row.id" class="expense-card p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ row.date }}</span>
            <span :class="['font-bold', getAmountColor(row)]">{{ row.amount }}</span>
          </div>

          <div class="mb-3 font-semibold text-gray-900 dark:text-gray-100">
            {{ row.description }}
          </div>

          <div class="flex justify-between items-center">
            <UBadge color="gray" variant="solid" size="xs">{{ row.category }}</UBadge>
            <div class="flex gap-2">
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
  if (row.credit > 0) return 'text-green-600 dark:text-green-400';
  if (row.debit > 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-900 dark:text-gray-100';
}
</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.expense-list-container {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.charts-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
}

.chart {
  width: 48%;
  height: 300px;
  margin-bottom: 20px;
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
  width: 100px; /* Date column */
}

:deep(th:nth-child(2)),
:deep(td:nth-child(2)) {
  width: 150px; /* Category column */
}

:deep(th:nth-child(3)),
:deep(td:nth-child(3)) {
  width: 300px; /* Description column */
}

:deep(th:nth-child(4)),
:deep(td:nth-child(4)) {
  width: 100px; /* Amount column */
}

:deep(th:nth-child(5)),
:deep(td:nth-child(5)) {
  width: 100px; /* Actions column */
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.modal-title {
  font-size: 18px;
  font-weight: semibold;
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

  .chart {
    width: 100%;
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
</style>
