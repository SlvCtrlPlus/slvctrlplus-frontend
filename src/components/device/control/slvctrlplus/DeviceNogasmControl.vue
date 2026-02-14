<script setup lang="ts">
import {computed, ref} from "vue";
import StreamLineChart from "../../../chart/StreamLineChart.vue";
import {
  Chart,
  Color,
  LinearScaleOptions,
  ScriptableLineSegmentContext
} from "chart.js";
import ChartHelper, {LineChartData, LineChartOptions} from "../../../../helper/ChartHelper";
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
const deviceComm = new DeviceCommunicator(props.device, io);

const modeNames = new Map<number, string>([[1, 'Manual'],[2, 'Automatic']]);
const colorThreshold = { r: 244, g: 67, b: 54 };
const colorDeviationOk = {r: 0, g: 189, b: 126 };
const colorDeviationNok = {r: 255, g: 152, b: 0};

const thresholdDataset = ChartHelper.createEmptyDataSet({
  label: "Threshold",
  color: colorThreshold,
  densityLine: 0.7,
  fill: false,
});

const dynamicLineColoring = (alpha: number) => (ctx: ScriptableLineSegmentContext): Color | undefined => {
  const { p0, p1, p0DataIndex: i0, p1DataIndex: i1 } = ctx;

  const a0 = ChartHelper.getY(thresholdDataset.data[i0]);
  const a1 = ChartHelper.getY(thresholdDataset.data[i1]);

  if (a0 === undefined || a1 === undefined) return ChartHelper.getCssColor(colorDeviationOk, alpha);

  const below = p0.parsed.y < a0 && p1.parsed.y < a1;
  return ChartHelper.getCssColor(below ? colorDeviationOk : colorDeviationNok, alpha);
};

const chartData: LineChartData = {
  datasets: [
    ChartHelper.createEmptyDataSet({
      label: "Pressure deviation",
      color: colorDeviationOk,
      segment: {
        borderColor: dynamicLineColoring(1),
        backgroundColor: dynamicLineColoring(0.1),
      },
    }),
    thresholdDataset,
  ],
};

const onRefresh = (chart: Chart): void => {
  const deviceAttrs = props.device.attributes;

  if (undefined === deviceAttrs.avgPressure.value ||
      undefined === deviceAttrs.currentPressure.value ||
      undefined === deviceAttrs.maxPressureDelta.value
  ) {
    return;
  }

  const avgPressureValue = deviceAttrs.avgPressure.value;
  const maxNormalizedPressure = deviceAttrs.maxPressureDelta.value * 1.3;
  let normalizePressure = deviceAttrs.currentPressure.value - avgPressureValue;

  normalizePressure = (normalizePressure > maxNormalizedPressure) ? maxNormalizedPressure : normalizePressure;

  chart.data.datasets[0].data.push({
    x: Date.now(),
    y: Number(normalizePressure > 0 ? normalizePressure : 0),
  });

  chart.data.datasets[1].data.push({
    x: Date.now(),
    y: Number(deviceAttrs.maxPressureDelta.value),
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

const maxCurrentSpeed = computed(() => props.device.attributes.mode.value === 1
  ? props.device.attributes.currentSpeed.max
  : props.device.attributes.maxSpeed.value
);
const isAutomaticMode = computed(() => props.device.attributes.mode.value === 2);
const isInCoolDown = computed(() =>
    undefined !== props.device.attributes.remainingCoolDownTime.value &&
    props.device.attributes.remainingCoolDownTime.value > 0
);
const currentSpeedPercentage = computed(() => {
  const maxSpeed = props.device.attributes.maxSpeed.value;
  const currentSpeed = props.device.attributes.currentSpeed.value;

  if (undefined === maxSpeed || undefined === currentSpeed) {
    return 0;
  }

  return Math.round(currentSpeed / maxSpeed * 100);
});
const coolDownTotalSeconds = computed(() => Math.max(1, Math.round((props.device.attributes.rampUpTime.value ?? 0) / 2)));
const coolDownLeftSeconds = computed(() => Math.max(0, props.device.attributes.remainingCoolDownTime.value || 0));
const coolDownPercent = computed(() => (coolDownLeftSeconds.value / coolDownTotalSeconds.value) * 100);
const modeOptions = computed(() => props.device.attributes.mode.values.map(e => ({ title: modeNames.get(e.key) ?? e.key, value: e.key })));
</script>

<template>
  <StreamLineChart
    :chartData="chartData"
    :chartOptions="chartOptions"
    @mouseover="ChartHelper.pauseChart(chartOptionsRef)"
    @mouseleave="ChartHelper.resumeChart(chartOptionsRef)"
  />
  <div v-if="isAutomaticMode" class="pa-0 my-4 transition-bg">
    <v-divider class="my-4"></v-divider>
    <transition name="fade" mode="out-in">
      <div v-if="isInCoolDown" key="cooldown">
        <v-progress-linear
          :model-value="coolDownPercent"
          :chunk-count="coolDownTotalSeconds"
          color="blue-lighten-2"
          height="10"
          rounded
          class="mb-4"
        />
        <v-icon icon="mdi-snowflake" class="mb-1" />
        Cool down: <b>{{ coolDownLeftSeconds }} seconds</b> left
      </div>
      <div v-else key="speed">
        <v-progress-linear
            :model-value="currentSpeedPercentage"
            color="purple"
            height="10"
            rounded
            class="mb-4"
        />
        <v-icon icon="mdi-speedometer" class="mb-1" />
        Vibrator ramp up: <b>{{ currentSpeedPercentage }}%</b>
      </div>
    </transition>
  </div>
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
          :items="modeOptions"
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
  <dl v-if="isAutomaticMode">
    <dt><label>Max. vibrator speed <v-tooltip location="left" class="tooltip">
      <template #activator="{ props }">
        <v-icon v-bind="props" color="grey-darken-2" icon="mdi-information-outline" size="small" />
      </template>
      The maximum speed the vibrator will reach in "Automatic" mode after being fully ramped up.
    </v-tooltip></label></dt>
    <dd>
      <DebouncedSlider
          :model-value="props.device.attributes.maxSpeed.value"
          @update:model-value="value => deviceComm.setAttribute('maxSpeed', value)"
          :attribute="props.device.attributes.maxSpeed"
          :slider-debounce="50"
          :input-debounce="100"
          :disabled="!isAutomaticMode"
      />
    </dd>
  </dl>
  <dl v-if="!isAutomaticMode">
    <dt><label>Current vibrator speed <v-tooltip v-if="isAutomaticMode" location="left" class="tooltip">
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
          :disabled="isAutomaticMode"
      />
    </dd>
  </dl>
  <dl v-if="isAutomaticMode">
    <dt><label>Ramp up time (seconds) <v-tooltip location="left" class="tooltip">
      <template #activator="{ props }">
        <v-icon v-bind="props" color="grey-darken-2" icon="mdi-information-outline" size="small" />
      </template>
      The time it takes in seconds to ramp the vibrator up from 0 to the "Max. vibrator speed" after a cooldown period has ended.
    </v-tooltip></label></dt>
    <dd>
      <DebouncedSlider
          :model-value="props.device.attributes.rampUpTime.value"
          @update:model-value="value => deviceComm.setAttribute('rampUpTime', value)"
          :attribute="props.device.attributes.rampUpTime"
          :slider-debounce="50"
          :input-debounce="100"
          :disabled="!isAutomaticMode"
      />
    </dd>
  </dl>
</template>

<style scoped>
.tooltip {
  max-width: 640px;
}

/* Ensure the container has relative positioning for absolute children */
.transition-container {
  position: relative;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>
