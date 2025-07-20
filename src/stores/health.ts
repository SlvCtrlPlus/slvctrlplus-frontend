import { defineStore } from "pinia";
import { ref, reactive, type Ref } from "vue";
import type { ChartData } from "chart.js";
import ChartHelper from "../helper/ChartHelper";
import { useBackendStore } from "@/stores/backend";
import { apiFetch } from "@/utils/apiFetch";

interface SystemInfo {
  process: {
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
  };
  system: {
    cpu: {
      usage: number;
      model: string;
    };
    memory: {
      totalMemMb: number;
      usedMemMb: number;
      freeMemMb: number;
      usedMemPercentage: number;
      freeMemPercentage: number;
    };
    os: {
      name: string;
    };
    uptime: number;
    hostname: string;
    ip: string;
  };
}

type HealthChartData = {
  processMemory: ChartData<"line">;
  systemCpu: ChartData<"line">;
  systemMemory: ChartData<"line">;
}

type HealthStore = {
  state: Ref<SystemInfo | undefined>;
  chartData: HealthChartData;
  init: () => void;
};

export const useHealthStore = defineStore("health", (): HealthStore => {
  // state refs/reactive
  const state = ref<SystemInfo | undefined>(undefined);

  // For chartData, since it is nested and complex, use reactive
  const chartData = reactive({
    processMemory: {
      datasets: [
        ChartHelper.createEmptyDataSet("Resident Set Size", { r: 0, g: 189, b: 126 }, 0),
        ChartHelper.createEmptyDataSet("Heap total", { r: 0, g: 189, b: 126 }, 0),
        ChartHelper.createEmptyDataSet("Heap used", { r: 204, g: 0, b: 0 }, 0),
      ],
    } as ChartData<"line">,
    systemCpu: {
      datasets: [
        ChartHelper.createEmptyDataSet("Percentage", { r: 0, g: 189, b: 126 }, 0),
      ],
    } as ChartData<"line">,
    systemMemory: {
      datasets: [
        ChartHelper.createEmptyDataSet("Percentage", { r: 0, g: 189, b: 126 }, 0),
      ],
    } as ChartData<"line">,
  });

  // actions
  function init(): void {
    const backendStore = useBackendStore();

    setInterval(async () => {
      if (!backendStore.isServerOnline) {
        return;
      }

      const response = await apiFetch(`/health`);
      state.value = await response.json();
    }, 500);

    setInterval(() => {
      if (!backendStore.isServerOnline || !chartData || !state.value) {
        return;
      }

      chartData.processMemory.datasets[0].data.push({
        x: Date.now(),
        y: Number((state.value.process.memoryUsage.rss / 1024 / 1024).toFixed(2)),
      });
      chartData.processMemory.datasets[1].data.push({
        x: Date.now(),
        y: Number((state.value.process.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)),
      });
      chartData.processMemory.datasets[2].data.push({
        x: Date.now(),
        y: Number((state.value.process.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)),
      });

      chartData.systemCpu.datasets[0].data.push({
        x: Date.now(),
        y: Number(state.value.system.cpu.usage.toFixed(2)),
      });

      chartData.systemMemory.datasets[0].data.push({
        x: Date.now(),
        y: Number(state.value.system.memory.usedMemPercentage.toFixed(2)),
      });
    }, 425);
  }

  return {
    state,
    chartData,
    init,
  };
});
