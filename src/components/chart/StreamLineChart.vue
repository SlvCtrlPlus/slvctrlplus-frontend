<script setup lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler,
} from "chart.js";
import type { ChartOptions, ChartData, Plugin } from "chart.js";
import "chartjs-adapter-luxon";
import ChartStreaming from "chartjs-plugin-streaming";

interface Props {
  chartData: ChartData<"line">;
  chartOptions: ChartOptions<"line">;
}

const props = defineProps<Props>();

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler,
  ChartStreaming
);

const plugins: Plugin[] = [];
</script>

<template>
  <Line
    :chartData="props.chartData"
    :chartOptions="props.chartOptions"
    chartId="foo-id"
    :width="400"
    :height="200"
    :plugins="plugins"
  />
</template>
