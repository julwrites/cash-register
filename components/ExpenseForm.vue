<template>
  <form @submit.prevent="submitForm">
    <div class="form-group">
      <label for="description">Description:</label>
      <input type="text" id="description" v-model="expense.description" required />
    </div>
    <div class="form-group">
      <label for="amount">Amount:</label>
      <input type="number" id="amount" step="0.01" min="0.01" v-model="expense.amount" required />
    </div>
    <div class="form-group">
      <label for="category">Category:</label>
      <select id="category" v-model="expense.categoryId" required>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
    </div>
    <div class="form-group">
      <label for="date">Date:</label>
      <date-picker v-model="expense.date" required />
    </div>
    <button type="submit">Save Expense</button>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue';
import DatePicker from '@/components/DatePicker.vue';
import useCategories from '@/composables/useCategories';
import useExpenses from '@/composables/useExpenses';

const expense = reactive({ description: '', amount: 0, categoryId: null, date: '' });
const { categories } = useCategories();
const { addExpense } = useExpenses();

async function submitForm() {
  await addExpense(expense);
  // Clear the form and reset values for reuse
  Object.assign(expense, { description: '', amount: 0, categoryId: null, date: '' });
}
</script>

<style scoped>
/* Add your styles here */
</style>