<template>
    <div class="categories">
      <h2>Categories</h2>
      <ul v-if="categories.length > 0">
        <li v-for="category in categories" :key="category.id" class="category-item">
          <div class="name">{{ category.name }}</div>
          <button @click="deleteCategory(category.id)">Delete</button>
        </li>
      </ul>
      <p v-else>No categories to display.</p>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import useCategories from '@/composables/useCategories';
  
  const { categories, fetchCategories, deleteCategory } = useCategories();
  
  onMounted(async () => {
    await fetchCategories();
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>