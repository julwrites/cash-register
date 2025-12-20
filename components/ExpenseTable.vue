<template>
  <div class="w-full">
    <!-- Desktop Table View -->
    <div class="hidden md:block overflow-x-auto">
      <UTable
        :rows="entries"
        :columns="columns"
        :loading="loading"
        :sort="sort"
        class="w-full"
        :ui="{
          td: { base: 'max-w-[300px] truncate' },
          th: { base: 'whitespace-nowrap' }
        }"
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
    <div class="block md:hidden space-y-4">
      <div v-if="loading" class="flex items-center justify-center p-8 text-gray-500">
         <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin w-6 h-6 mr-2" />
         <span>Loading expenses...</span>
      </div>

      <div v-else-if="entries.length === 0" class="flex flex-col items-center justify-center p-8 text-gray-500">
         <UIcon name="i-heroicons-clipboard-document-list-20-solid" class="w-12 h-12 mb-2" />
         <span>No expenses found for this period.</span>
      </div>

      <template v-else>
        <div v-for="row in entries" :key="row.id" class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ row.date }}</span>
            <span :class="['font-bold', getAmountColor(row)]">{{ row.amount }}</span>
          </div>

          <div class="mb-3 font-semibold text-gray-900 dark:text-gray-100 truncate">
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
