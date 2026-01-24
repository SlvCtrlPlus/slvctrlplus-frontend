<script setup lang="ts">
import {computed, ref} from "vue";
import StreamLineChart from "../../../chart/StreamLineChart.vue";
import {
  Chart,
  ChartData,
  Color,
  LinearScaleOptions,
  ScriptableLineSegmentContext
} from "chart.js";
import ChartHelper, {LineChartOptions} from "../../../../helper/ChartHelper";
import { merge } from "chart.js/helpers";
import {DeviceNogasm} from "@/model/devices/slvctrl/DeviceNogasm";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";
import DeviceCommunicator from "@/helper/DeviceCommunicator";
import {useSocketIO} from "@/plugins/vueSocketIOClient";
import type {Socket} from "socket.io-client";

interface Props {
  device: DeviceNogasm;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;
const deviceComm = new DeviceCommunicator<Props['device']>(props.device, io);

const modeNames = new Map<string, string>([['1', 'Manual'],['2', 'Automatic']]);

const thresholdDataset = ChartHelper.createEmptyDataSet({
  label: "Threshold",
  color: { r: 244, g: 67, b: 54 },
  densityLine: 0.7,
  fill: false,
});

const dynamicLineColoring = (alpha: number) => (ctx: ScriptableLineSegmentContext): Color | undefined => {
  const { p0, p1, p0DataIndex: i0, p1DataIndex: i1 } = ctx;

  const a0 = ChartHelper.getY(thresholdDataset.data[i0]);
  const a1 = ChartHelper.getY(thresholdDataset.data[i1]);

  if (a0 === undefined || a1 === undefined) return "orange";

  const below = p0.parsed.y < a0 && p1.parsed.y < a1;
  return below ? `rgba(0,189,126,${alpha})` : `rgba(255,152,0,${alpha})`;
};

const chartData: ChartData<"line"> = {
  datasets: [
    ChartHelper.createEmptyDataSet({
      label: "Pressure deviation",
      color: {r: 0, g: 189, b: 126 },
      segment: {
        borderColor: dynamicLineColoring(1),
        backgroundColor: dynamicLineColoring(0.1),
      },
    }),
    thresholdDataset,
  ],
};

const onRefresh = (chart: Chart): void => {
  if (undefined === props.device.attributes.avgPressure.value ||
      undefined === props.device.attributes.currentPressure.value ||
      undefined === props.device.attributes.maxPressureDelta.value
  ) {
    return;
  }

  const avgPressureValue = props.device.attributes.avgPressure.value;
  const maxNormalizedPressure = props.device.attributes.maxPressureDelta.value * 1.3;
  let normalizePressure = props.device.attributes.currentPressure.value - avgPressureValue;

  normalizePressure = (normalizePressure > maxNormalizedPressure) ? maxNormalizedPressure : normalizePressure;

  chart.data.datasets[0].data.push({
    x: Date.now(),
    y: Number(normalizePressure > 0 ? normalizePressure : 0),
  });

  chart.data.datasets[1].data.push({
    x: Date.now(),
    y: Number(props.device.attributes.maxPressureDelta.value),
  });

  (chart.options.scales!.y! as LinearScaleOptions).suggestedMax = maxNormalizedPressure;
};

const chartOptions = merge<LineChartOptions, LineChartOptions>(
  ChartHelper.createStreamChartOptions(20000, 425, 500, onRefresh),
  {
    scales: {
      y: {
        suggestedMin: 0,
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          boxWidth: 12,
          boxHeight: 2,
        },
      },
    },
  },
);

const chartOptionsRef = ref<LineChartOptions>(chartOptions);

const maxCurrentSpeed = computed(() => props.device.attributes.mode.value === '1'
  ? props.device.attributes.currentSpeed.max
  : props.device.attributes.maxSpeed.value
);
</script>

<template>
  <StreamLineChart
    :chartData="chartData"
    :chartOptions="chartOptions"
    @mouseover="ChartHelper.pauseChart(chartOptionsRef)"
    @mouseleave="ChartHelper.resumeChart(chartOptionsRef)"
  />
  <v-divider class="my-4"></v-divider>
  <dl>
    <dt><label>Mode <v-tooltip location="left" class="tooltip">
      <template #activator="{ props }">
        <v-icon v-bind="props" color="grey-darken-2" icon="mdi-information-outline" size="small" />
      </template>
      <strong>Manual:</strong> the vibrator is not driven based on orgasm detection and has to be controlled manually.<br><strong>Automatic:</strong> The vibrator ramps up and stays at the max. level until an orgasm attempt is detected. If that's the case the vibrator will be turned off immediately and a cooldown period starts (half of the ramp up time). After the cool down period ends, the vibrator starts to ramp up again.
    </v-tooltip></label></dt>
    <dd>
      <v-select
          :model-value="props.device.attributes.mode.value"
          :items="Object.entries(props.device.attributes.mode.values || {}).map(([laKey, value]) => ({ title: modeNames.get(laKey) ?? value, value: laKey }))"
          color="primary"
          class="pa-0 mt-2"
          density="compact"
          @update:modelValue="value => deviceComm.setAttribute('mode', value)"
      ></v-select>
    </dd>
  </dl>
  <dl>
    <dt><label>Sensitivity <v-tooltip location="left" class="tooltip">
      <template #activator="{ props }">
        <v-icon v-bind="props" color="grey-darken-2" icon="mdi-information-outline" size="small" />
      </template>
      Defines how quickly an increase in pressure is rated as an orgasm attempt. A too high sensitivity (e.g., 30) will
      make the vibrator never turn on. A too low sensitivity (e.g., 1) will not detect any orgasm attempts at all/too late.
    </v-tooltip></label></dt>
    <dd>
      <DebouncedSlider
        :model-value="props.device.attributes.sensitivity.value"
        @update:model-value="value => deviceComm.setAttribute('sensitivity', value)"
        :attribute="props.device.attributes.sensitivity"
        :slider-debounce="50"
        :input-debounce="100"
      />
    </dd>
  </dl>
  <dl>
    <dt><label>Vibrator speed <v-tooltip v-if="props.device.attributes.mode.value !== '1'" location="left" class="tooltip">
      <template #activator="{ props }">
        <v-icon v-bind="props" color="grey-darken-2" icon="mdi-information-outline" size="small" />
      </template>
      The vibrator speed cannot be controlled manually while the device is running in "Automatic" mode.
    </v-tooltip></label></dt>
    <dd>
      <DebouncedSlider
          :model-value="props.device.attributes.currentSpeed.value"
          @update:model-value="value => deviceComm.setAttribute('currentSpeed', value)"
          :attribute="props.device.attributes.currentSpeed"
          :slider-debounce="50"
          :input-debounce="100"
          :max="maxCurrentSpeed"
          :disabled="props.device.attributes.mode.value !== '1'"
      />
    </dd>
  </dl>
</template>

<style scoped>
.tooltip {
  max-width: 640px;
}
</style>