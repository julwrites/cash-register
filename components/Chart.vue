<template>
    <div class="chart">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch } from 'vue';
  import Chart from 'chart.js/auto';
  
  const props = defineProps({
    data: {
      type: Array,
      required: true,
    },
  });
  
  const chartCanvas = ref(null);
  let chartInstance = null;
  
  function createChart() {
    if (chartInstance) {
      chartInstance.destroy();
    }
  
    const ctx = chartCanvas.value.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'bar', // or another type of chart
      data: {
        labels: props.data.map((item) => item.label),
        datasets: [
          {
            label: 'Data',
            data: props.data.map((item) => item.value),
            backgroundColor: '#4287f5', // customize color as needed
          },
        ],
      },
    });
  }
  
  onMounted(() => {
    createChart();
  });
  
  watch(props.data, () => {
    createChart();
  });
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>