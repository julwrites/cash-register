<template>
  <div class="chart">
    <h4>Income vs Expenses</h4>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const { colors } = useThemeColors();

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: {
        color: colors.value.text,
      },
      grid: {
        color: colors.value.grid,
      },
    },
    y: {
      ticks: {
        color: colors.value.text,
      },
      grid: {
        color: colors.value.grid,
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: colors.value.text,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data[0] + context.dataset.data[1];
          const percentage = ((value / total) * 100).toFixed(2);
          const formattedValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value);
          return `${label}: ${formattedValue} (${percentage}%)`;
        },
      },
    },
  },
}));
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>
