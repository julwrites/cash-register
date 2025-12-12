<template>
  <div class="filters">
    <USelectMenu
      v-model="localSelectedPeriod"
      :options="periodOptions"
      placeholder="Select time period"
    />
    <USelectMenu
      v-model="localSelectedCategory"
      :options="categoryOptions"
      placeholder="Select category"
    />

    <div class="filter-actions">
      <UButton
        class="filter-reset"
        variant="outline"
        @click="$emit('reset-filters')"
        >Reset Filters</UButton
      >
    </div>

    <div
      v-if="localSelectedPeriod.value === 'custom'"
      class="date-range-picker"
    >
      <UInput
        v-model="localStartDate"
        type="date"
        placeholder="Start Date"
        @change="emitDateChange"
      />
      <UInput
        v-model="localEndDate"
        type="date"
        placeholder="End Date"
        @change="emitDateChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps({
  selectedPeriod: Object,
  selectedCategory: Object,
  categoryOptions: Array,
  startDate: String,
  endDate: String,
});

const emit = defineEmits([
  'update:selectedPeriod',
  'update:selectedCategory',
  'update:startDate',
  'update:endDate',
  'reset-filters',
]);

const localSelectedPeriod = computed({
  get: () => props.selectedPeriod,
  set: (value) => emit('update:selectedPeriod', value),
});

const localSelectedCategory = computed({
  get: () => props.selectedCategory,
  set: (value) => emit('update:selectedCategory', value),
});

const localStartDate = ref(props.startDate || '');
const localEndDate = ref(props.endDate || '');

watch(
  () => props.startDate,
  (newValue) => {
    localStartDate.value = newValue || '';
  }
);

watch(
  () => props.endDate,
  (newValue) => {
    localEndDate.value = newValue || '';
  }
);

const emitDateChange = () => {
  emit('update:startDate', localStartDate.value);
  emit('update:endDate', localEndDate.value);
};

const periodOptions = [
  { label: 'All Time', value: '' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' },
];
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.filter-reset {
  color: var(--color-danger);
}

.date-range-picker {
  display: flex;
  gap: 10px;
}

:deep(.form-group) {
  flex: 1;
  min-width: 200px;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  :deep(.form-group) {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    justify-content: space-between;
  }

  .filter-actions button {
    flex: 1;
  }

  .date-range-picker {
    flex-direction: column;
  }
}
</style>
