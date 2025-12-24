<template>
  <UModal v-model="isOpen">
    <UCard class="edit-modal">
      <template #header>
        <h3 class="section-title modal-header-title">Edit Expense</h3>
      </template>
      <ExpenseForm
        :expense="expense"
        submit-button-text="Update"
        @submit="$emit('save', $event)"
        @cancel="$emit('cancel')"
      />
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ExpenseForm from '@/components/ExpenseForm.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  expense: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:isOpen', 'save', 'cancel']);

const isOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value),
});
</script>

<style scoped>
.modal-header-title {
  margin-bottom: 0;
}

.edit-modal {
  max-width: 32rem;
  width: 100%;
  margin: 0 auto;
}
</style>
