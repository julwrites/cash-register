<template>
  <div class="chart">
    <h4>Expenses by Category</h4>
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  chartData: {
    type: Object,
    required: true,
  },
});

const { colors } = useThemeColors();

const totalExpenses = computed(() =>
  props.chartData.datasets[0].data.reduce((acc: number, curr: number) => acc + curr, 0)
);

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: colors.value.text,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const label = context.label || '';
          const value = context.raw || 0;
          const percentage = ((value / totalExpenses.value) * 100).toFixed(2);
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
