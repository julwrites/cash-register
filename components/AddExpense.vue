<template>
  <div class="page-container">
    <h3 class="page-title">Add New Record</h3>
    <ExpenseForm
      :expense="newExpense"
      submit-button-text="Submit"
      @submit="addExpense"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExpenseForm from '@/components/ExpenseForm.vue';
import { defaultExpense } from '@/composables/defaultExpense';

const newExpense = ref<Expense>({ ...defaultExpense });

const toast = useToast();

async function addExpense(expense: Expense) {
  try {
    const response = await fetch('/api/expenses/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.statusMessage || 'Failed to add expense');
    }

    // Clear the form after successful submission
    newExpense.value = { ...defaultExpense };

    // Show success message
    toast.add({ title: 'Expense added successfully!', color: 'green' });
  } catch (error) {
    toast.add({
      title: 'Failed to add expense',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'red',
    });
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
}

.page-title {
  text-align: center;
}
</style>
