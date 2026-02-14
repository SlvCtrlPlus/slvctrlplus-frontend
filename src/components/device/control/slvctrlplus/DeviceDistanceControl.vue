<script setup lang="ts">
import { computed, ref } from "vue";
import StreamLineChart from "../../../chart/StreamLineChart.vue";
import type {Chart, ChartOptions} from "chart.js";
import ChartHelper from "@/helper/ChartHelper";
import type {LineChartData} from "@/helper/ChartHelper";
import { merge } from "chart.js/helpers";
import type {DeviceDistance} from "@/model/devices/slvctrl/DeviceDistance";

interface Props {
  device: DeviceDistance;
}

const props = defineProps<Props>();
const currentDistance = computed((): number|undefined => {
  if (props.device.attributes.sensor.value !== 'ok') {
    return undefined;
  }

  const tmpDistance = props.device.attributes.distance.value;

  if (undefined === tmpDistance || tmpDistance >= 255) {
    return undefined;
  }

  return tmpDistance;
});

const chartData: LineChartData = {
  datasets: [
    ChartHelper.createEmptyDataSet({
      label: "Distance",
      color: { r: 0, g: 189, b: 126 },
      spanGaps: 1000,
    }),
  ],
};

const onRefresh = (chart: Chart): void => {
  if (undefined === currentDistance.value) {
    return;
  }

  chart.data.datasets[0].data.push({
    x: Date.now(),
    y: Number((currentDistance.value * 0.1).toFixed(1)),
  });
};

const chartOptions = merge(
  ChartHelper.createStreamChartOptions(20000, 425, 500, onRefresh),
  {
    scales: {
      y: {
        suggestedMin: 0,
        suggestedMax: 20,
      },
    },
  }
);

const chartOptionsRef = ref<ChartOptions<"line">>(chartOptions);
</script>

<template>
  <dl>
    <dt><label>Distance</label></dt>
    <dd class="text-h3 text-primary">
      <span v-if="currentDistance === 183">&gt;</span
      >{{ undefined === currentDistance ? '&ndash;' : `${(currentDistance * 0.1).toFixed(1)}cm` }}
    </dd>
  </dl>
  <v-divider class="my-4"></v-divider>
  <StreamLineChart
    :chartData="chartData"
    :chartOptions="chartOptions"
    @mouseover="ChartHelper.pauseChart(chartOptionsRef)"
    @mouseleave="ChartHelper.resumeChart(chartOptionsRef)"
  />
</template>
