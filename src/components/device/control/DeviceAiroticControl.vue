<script setup lang="ts">
import { useRequiredSocketIO } from '@/plugins/vueSocketIOClient';
import DeviceCommunicator from '@/helper/DeviceCommunicator';
import type { DeviceAirotic } from '@/model/devices/airotic/DeviceAirotic';
import { ref, computed, watch } from 'vue';
import { useDeviceNotificationsStore } from '@/stores/deviceNotifications';
import type { DeviceNotificationEvent } from '@/stores/deviceNotifications';
import StreamLineChart from '@/components/chart/StreamLineChart.vue';
import type { Chart, ChartOptions } from 'chart.js';
import ChartHelper from '@/helper/ChartHelper';
import type { LineChartData } from '@/helper/ChartHelper';
import { merge } from 'chart.js/helpers';

interface Props {
  device: DeviceAirotic;
}

const props = defineProps<Props>();
const io = useRequiredSocketIO();

const deviceComm = new DeviceCommunicator(props.device, io);

const parseColor = (val: string | undefined): { r: number; g: number; b: number } => {
  if (!val) return { r: 0, g: 0, b: 0 };
  const [r, g, b] = val.split(',').map(Number);
  return { r: r ?? 0, g: g ?? 0, b: b ?? 0 };
};

const localRestColor = ref(parseColor(props.device.attributes.restColor.value));
const localBreathInColor = ref(parseColor(props.device.attributes.breathInColor.value));

const restColorCss = computed(() => {
  const c = localRestColor.value;
  return `rgb(${c.r},${c.g},${c.b})`;
});
const breathInColorCss = computed(() => {
  const c = localBreathInColor.value;
  return `rgb(${c.r},${c.g},${c.b})`;
});

const restColorMenu = ref(false);
const breathInColorMenu = ref(false);

const applyRestColor = (): void => {
  deviceComm.setAttribute('restColor', localRestColor.value.r + ',' + localRestColor.value.g + ',' + localRestColor.value.b);
  restColorMenu.value = false;
};

const applyBreathInColor = (): void => {
  deviceComm.setAttribute('breathInColor', localBreathInColor.value.r + ',' + localBreathInColor.value.g + ',' + localBreathInColor.value.b);
  breathInColorMenu.value = false;
};

const rssiIcon = computed<{icon: string, color?: string}>(() => {
  const rssi = props.device.rssi;

  if (rssi >= -60) return { icon: 'mdi-wifi-strength-4', color: undefined };
  if (rssi >= -70) return { icon: 'mdi-wifi-strength-3', color: undefined };
  if (rssi >= -80) return { icon: 'mdi-wifi-strength-2', color: 'warning' };

  return { icon: 'mdi-wifi-strength-1', color: 'error' };
});

const breathsPerMin = computed(() => {
  const rawData = props.device.attributes.breathsPerMin.value;
  return (undefined === rawData) ? undefined : Math.round(rawData * 10) / 10;
});

const bpmTrend = computed(() => props.device.attributes.bpmTrend.value);

const deviceNotificationsStore = useDeviceNotificationsStore();

const latestNotification = computed<DeviceNotificationEvent | undefined>(
  () => deviceNotificationsStore.getLatest(props.device.deviceId)
);

// 0 = restColor active, 1 = breathInColor active
const breathState = ref<0 | 1>(0);

watch(() => props.device.attributes.restColor.value, (val) => {
  localRestColor.value = parseColor(val);
});

watch(() => props.device.attributes.breathInColor.value, (val) => {
  localBreathInColor.value = parseColor(val);
});

watch(latestNotification, (event) => {
  if (!event) return;
  const { type, data } = event.notification;

  if (type === 'colorChange') {
    breathState.value = data.colorType === 'breathInColor' ? 1 : 0;
  }
});

// Chart
const chartData: LineChartData = {
  datasets: [
    {
      ...ChartHelper.createEmptyDataSet({
        label: 'Breath phase',
        color: { r: 0, g: 189, b: 126 },
        tension: 0,
      }),
      stepped: 'before' as const,
    },
  ],
};

const onRefresh = (chart: Chart): void => {
  chart.data.datasets[0].data.push({
    x: Date.now(),
    y: breathState.value,
  });
};

const chartOptions = merge(
  ChartHelper.createStreamChartOptions(30000, 250, 500, onRefresh),
  {
    scales: {
      y: {
        min: 0,
        max: 1,
        display: false,
      },
    },
  }
);

const chartOptionsRef = ref<ChartOptions<'line'>>(chartOptions);
</script>

<template>
  <StreamLineChart
    :chartData="chartData"
    :chartOptions="chartOptions"
    :height="100"
    @mouseover="ChartHelper.pauseChart(chartOptionsRef)"
    @mouseleave="ChartHelper.resumeChart(chartOptionsRef)"
  />

  <dl>
    <dt class="mt-4 mb-2"><label>Breathing frequency</label></dt>
    <dd class="text-h3 text-primary d-flex align-center ga-2">
      {{ undefined === breathsPerMin ? '&ndash;' : `${breathsPerMin.toFixed(1)}/min` }}
      <span v-if="bpmTrend === 'up'">&ShortUpArrow;</span>
      <span v-if="bpmTrend === 'down'">&ShortDownArrow;</span>
      <span v-if="bpmTrend === 'stable'">&ShortRightArrow;</span>
    </dd>
  </dl>

  <v-divider class="my-4" />

  <v-row align="center" no-gutters>
      <v-col cols="6">
        <div class="d-flex align-center ga-3 color-trigger" @click="restColorMenu = true">
          <span class="color-patch" :style="{ backgroundColor: restColorCss }" />
          <div>
            <h3>Rest color</h3>
            <span class="text-link">Change</span>
          </div>
        </div>
        
        <v-dialog v-model="restColorMenu" max-width="360">
          <v-card>
            <v-card-title>Rest color</v-card-title>
            <v-card-text>
              <v-color-picker
                v-model="localRestColor"
                mode="rgb"
                hide-inputs
                hide-eye-dropper
                width="100%"
                bgColor="grey-darken-3"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="restColorMenu = false">Cancel</v-btn>
              <v-btn color="primary" @click="applyRestColor">Apply Color</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
      <v-col cols="6">
        <div class="d-flex align-center ga-3 color-trigger" @click="breathInColorMenu = true">
          <span class="color-patch" :style="{ backgroundColor: breathInColorCss }" />
          <div>
            <h3>Breath in color</h3>
            <span class="text-link">Change</span>
          </div>
        </div>
        
        <v-dialog v-model="breathInColorMenu" max-width="360">
          <v-card>
            <v-card-title>Breath in color</v-card-title>
            <v-card-text>
              <v-color-picker
                v-model="localBreathInColor"
                mode="rgb"
                hide-inputs
                hide-eye-dropper
                width="100%"
                bgColor="grey-darken-3"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="breathInColorMenu = false">Cancel</v-btn>
              <v-btn color="primary" @click="applyBreathInColor">Apply Color</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
  </v-row>

  <v-divider class="mt-4" />

  <v-footer class="px-0 mt-2 mx-1">
    <v-row align="center" no-gutters>
      <v-col cols="auto">
        <v-btn class="pl-2 pr-3 mr-4" @click="deviceComm.setAttribute('resetColors', true)">
          <v-icon icon="mdi-restore" class="mr-2" />
          Reset Colors
        </v-btn>

        <v-btn class="pl-2 pr-3" color="grey-darken-3" @click="deviceComm.setAttribute('reboot', true)">
          <v-icon icon="mdi-restart" class="mr-2" />
          Reboot
        </v-btn>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-icon v-bind="props" :icon="rssiIcon.icon" :color="rssiIcon.color" />
          </template>
          Signal strength: {{ props.device.rssi }} dBm
        </v-tooltip>
      </v-col>
    </v-row>
  </v-footer>
</template>

<style scoped>
.color-patch {
  display: inline-block;
  width: 2.5em;
  height: 2.5em;
  border-radius: .5em;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.color-trigger {
  cursor: pointer;
}

.text-link {
  cursor: pointer;
  text-decoration: underline;
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
}
</style>
