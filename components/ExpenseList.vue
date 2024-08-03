<template>
    <div class="expenses">
      <h2>Expenses</h2>
      <ul v-if="expenses.length > 0">
        <li v-for="expense in expenses" :key="expense.id" class="expense-item">
          <div class="description">{{ expense.description }}</div>
          <div class="amount">${{ expense.amount }}</div>
          <div class="category">{{ getCategoryName(expense.categoryId) }}</div>
          <div class="date">{{ formatDate(expense.date) }}</div>
        </li>
      </ul>
      <p v-else>No expenses to display.</p>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, ref } from 'vue';
  import useCategories from '@/composables/useCategories';
  import useExpenses from '@/composables/useExpenses';
  
  const { categories } = useCategories();
  const { expenses, fetchExpenses } = useExpenses();
  
  onMounted(async () => {
    await fetchExpenses();
  });
  
  function getCategoryName(categoryId) {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }
  
  function formatDate(dateString) {
    // Implement your date formatting logic here
    return dateString;
  }
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>