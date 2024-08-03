<template>
    <div class="datepicker">
      <VDatePicker v-model="selectedDate" mode="single" />
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: Date,
      required: true,
    },
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const selectedDate = ref(props.modelValue);
  
  watch(selectedDate, (newDate) => {
    emit('update:modelValue', newDate);
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>