<template>
  <div class="chart">
    <h4>Income vs Expenses</h4>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

defineProps({
  chartData: {
    type: Object,
    required: true,
  },
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data[0] + context.dataset.data[1];
          const percentage = ((value / total) * 100).toFixed(2);
          return `${label}: $${value.toFixed(2)} (${percentage}%)`;
        },
      },
    },
  },
};
</script>

<style scoped>
.chart {
  width: 48%;
  height: 300px;
  margin-bottom: 20px;
}
</style>
