<template>
  <div class="space-y-4">
    <!-- Desktop Filters -->
    <div class="hidden md:flex flex-wrap gap-4 items-start">
      <USelectMenu
        v-model="localSelectedPeriod"
        :options="periodOptions"
        placeholder="Select time period"
        class="min-w-[200px]"
      />
      <USelectMenu
        v-model="localSelectedCategory"
        :options="categoryOptions"
        placeholder="Select category"
        class="min-w-[200px]"
      />

      <div class="flex gap-2" v-if="localSelectedPeriod.value === 'custom'">
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

      <div class="ml-auto">
        <UButton
          color="red"
          variant="outline"
          @click="$emit('reset-filters')"
          >Reset Filters</UButton
        >
      </div>
    </div>

    <!-- Mobile Filters -->
    <div class="md:hidden">
      <UAccordion :items="[{ label: 'Filters', slot: 'filters' }]">
        <template #filters>
          <div class="flex flex-col gap-4 p-2">
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
             <div
              v-if="localSelectedPeriod.value === 'custom'"
              class="flex flex-col gap-2"
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
