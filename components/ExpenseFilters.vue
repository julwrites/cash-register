<template>
  <div class="filters-container">
    <!-- Desktop Filters -->
    <div class="desktop-filters">
      <USelectMenu
        v-model="localSelectedPeriod"
        :options="periodOptions"
        placeholder="Select time period"
        class="filter-select"
        :popper="{ strategy: 'fixed' }"
      />
      <USelectMenu
        v-model="localSelectedCategory"
        :options="categoryOptions"
        placeholder="Select category"
        class="filter-select"
        :popper="{ strategy: 'fixed' }"
      />

      <div v-if="localSelectedPeriod.value === 'custom'" class="date-range-group">
        <UInput
          v-model="localStartDate"
          type="date"
          placeholder="Start Date"
          class="filter-input"
          @change="emitDateChange"
        />
        <UInput
          v-model="localEndDate"
          type="date"
          placeholder="End Date"
          class="filter-input"
          @change="emitDateChange"
        />
      </div>

      <div class="reset-btn-wrapper">
        <UButton
          color="red"
          variant="outline"
          @click="$emit('reset-filters')"
          >Reset Filters</UButton
        >
      </div>
    </div>

    <!-- Mobile Filters -->
    <div class="mobile-filters">
      <UAccordion :items="[{ label: 'Filters', slot: 'filters' }]">
        <template #filters>
          <div class="mobile-filter-content">
             <USelectMenu
              v-model="localSelectedPeriod"
              :options="periodOptions"
              placeholder="Select time period"
              class="filter-select"
              :popper="{ strategy: 'fixed' }"
            />
            <USelectMenu
              v-model="localSelectedCategory"
              :options="categoryOptions"
              placeholder="Select category"
              class="filter-select"
              :popper="{ strategy: 'fixed' }"
            />
             <div
              v-if="localSelectedPeriod.value === 'custom'"
              class="mobile-filter-content"
            >
              <UInput
                v-model="localStartDate"
                type="date"
                placeholder="Start Date"
                class="filter-input"
                @change="emitDateChange"
              />
              <UInput
                v-model="localEndDate"
                type="date"
                placeholder="End Date"
                class="filter-input"
                @change="emitDateChange"
              />
            </div>
             <UButton
              block
              color="red"
              variant="outline"
              @click="$emit('reset-filters')"
            >
              Reset Filters
            </UButton>
          </div>
        </template>
      </UAccordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps({
  selectedPeriod: { type: Object, default: () => ({ label: 'All Time', value: '' }) },
  selectedCategory: { type: Object, default: () => ({ label: 'All Categories', value: '' }) },
  categoryOptions: { type: Array, default: () => [] },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
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
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.desktop-filters {
  display: none;
}

@media (min-width: 768px) {
  .desktop-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-start;
  }
}

.filter-select {
  min-width: 200px;
}

.date-range-group {
  display: flex;
  gap: 0.5rem;
}

.reset-btn-wrapper {
  margin-left: auto;
}

.mobile-filters {
  display: block;
}

@media (min-width: 768px) {
  .mobile-filters {
    display: none;
  }
}

.mobile-filter-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
}
</style>
