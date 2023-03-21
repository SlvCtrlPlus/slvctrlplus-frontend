<script setup lang="ts">
import type { ChartOptions } from "chart.js";
import ChartHelper from "../helper/ChartHelper.js";
import { merge } from "chart.js/helpers";
import StreamLineChart from "../components/chart/StreamLineChart.vue";
import LoadingState from "../components/LoadingState.vue";
import { computed, ref, toRaw } from "vue";
import type { Ref } from "vue";
import moment from "moment";
import { storeToRefs } from "pinia";
import { useHealthStore } from "../stores/health";

const healthStore = useHealthStore();
const { state, chartData } = storeToRefs(healthStore);
const rawChartDataProcessMemory = toRaw(chartData.value.processMemory);
const rawChartDataSystemMemory = toRaw(chartData.value.systemMemory);
const rawChartDataSystemCpu = toRaw(chartData.value.systemCpu);

function getScales(suggestedMin: number, suggestedMax: number) {
  return {
    scales: {
      y: {
        suggestedMin: suggestedMin,
        suggestedMax: suggestedMax,
      },
      x: {
        display: true,
      },
    },
  };
}

const chartOptionsProcessMemory = merge(
  ChartHelper.createStreamChartOptions(20000, 425, 2000, null),
  getScales(0, 75)
);

const chartOptionsSystemMemory = merge(
  ChartHelper.createStreamChartOptions(20000, 425, 2000, null),
  getScales(0, 100)
);

const chartOptionsSystemCpu = merge(
  ChartHelper.createStreamChartOptions(20000, 425, 2000, null),
  getScales(0, 100)
);

const chartOptionsProcessMemoryRef = ref<ChartOptions>(
  chartOptionsProcessMemory
) as Ref<ChartOptions>;

const chartOptionsSystemMemoryRef = ref<ChartOptions>(
  chartOptionsSystemMemory
) as Ref<ChartOptions>;

const chartOptionsSystemCpuRef = ref<ChartOptions>(
  chartOptionsSystemCpu
) as Ref<ChartOptions>;

const uptime = computed(() => {
  if (healthStore.state === undefined) {
    return "calculating...";
  }

  return moment
    .duration(healthStore.state.system.uptime, "seconds")
    .humanize();
});
</script>

<template>
  <v-container fluid v-if="state !== undefined" class="px-sm-6">
    <h2 class="text-h4 text-grey-darken-1 py-4">System health</h2>
    <v-container fluid class="px-0">
      <v-row>
        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
          <v-card class="fill-height">
            <v-card-title>System information</v-card-title>
            <v-card-item>
              <v-list class="py-0">
                <v-list-item class="px-1">
                  <v-list-item-title>CPU</v-list-item-title>
                  <v-list-item-subtitle
                      v-text="
                      `${state.system.cpu.model} (${state.system.os.arch}, ${state.system.cpu.cores} cores)`
                    "
                  ></v-list-item-subtitle>
                </v-list-item>
                <v-list-item class="px-1">
                  <v-list-item-title>Operating System</v-list-item-title>
                  <v-list-item-subtitle
                      v-text="
                      `${state.system.os.name} (${state.system.os.type})`
                    "
                  ></v-list-item-subtitle>
                </v-list-item>
                <v-list-item class="px-1">
                  <v-list-item-title>IP address</v-list-item-title>
                  <v-list-item-subtitle v-text="state.system.ip"></v-list-item-subtitle>
                </v-list-item>
                <v-list-item class="px-1">
                  <v-list-item-title>Hostname</v-list-item-title>
                  <v-list-item-subtitle v-text="state.system.hostname"></v-list-item-subtitle>
                </v-list-item>
                <v-list-item class="px-1">
                  <v-list-item-title>Uptime</v-list-item-title>
                  <v-list-item-subtitle v-text="uptime"></v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
          <v-card class="fill-height">
            <v-card-title>Memory (SlvCtrl+)</v-card-title>
            <v-card-item>
              <p class="mb-3">
                <b>RSS:</b> {{ (state.process.memoryUsage.rss / 1024 / 1024).toFixed(2) }} MB,
                <b>Heap:</b> {{ (state.process.memoryUsage.heapTotal / 1024 / 1024).toFixed(2) }} MB
                (used: {{ (state.process.memoryUsage.heapUsed / 1024 / 1024).toFixed(2) }} MB)
              </p>
              <StreamLineChart
                :chartData="rawChartDataProcessMemory"
                :chartOptions="chartOptionsProcessMemory"
                @mouseover="ChartHelper.pauseChart(chartOptionsProcessMemoryRef)"
                @mouseleave="ChartHelper.resumeChart(chartOptionsProcessMemoryRef)"
              />
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
          <v-card class="fill-height">
            <v-card-title>CPU (System)</v-card-title>
            <v-card-item>
              <p class="mb-3">
                <b>Used:</b>
                {{ state.system.cpu.usage.toFixed(2) }}%
              </p>
              <StreamLineChart
                :chartData="rawChartDataSystemCpu"
                :chartOptions="chartOptionsSystemCpu"
                @mouseover="ChartHelper.pauseChart(chartOptionsSystemCpuRef)"
                @mouseleave="ChartHelper.resumeChart(chartOptionsSystemCpuRef)"
              />
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
          <v-card class="fill-height">
            <v-card-title>Memory (System)</v-card-title>
            <v-card-item>
              <p class="mb-3">
                <b>Free:</b>
                {{ (state.system.memory.freeMemMb / 1024).toFixed(2) }}
                GB, <b>Used:</b>
                {{ (state.system.memory.usedMemMb / 1024).toFixed(2) }}
                GB, <b>Total:</b>
                {{ (state.system.memory.totalMemMb / 1024).toFixed(2) }}
                GB
              </p>
              <StreamLineChart
                :chartData="rawChartDataSystemMemory"
                :chartOptions="chartOptionsSystemMemory"
                @mouseover="ChartHelper.pauseChart(chartOptionsSystemMemoryRef)"
                @mouseleave="ChartHelper.resumeChart(chartOptionsSystemMemoryRef)"
              />
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
  <LoadingState v-else msg="Loading health data" />
</template>

<style scoped></style>
