<template>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Category Name:</label>
        <input type="text" id="name" v-model="categoryName" required />
      </div>
      <button type="submit">Save Category</button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import useCategories from '@/composables/useCategories';
  
  const categoryName = ref('');
  const { addCategory } = useCategories();
  
  async function submitForm() {
    if (categoryName.value.trim()) {
      await addCategory(categoryName.value);
      categoryName.value = '';
    }
  }
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>