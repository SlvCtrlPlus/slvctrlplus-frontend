import { defineStore } from "pinia";
import { ref, reactive, type Ref } from "vue";
import type { ChartData } from "chart.js";
import ChartHelper from "../helper/ChartHelper";
import { useBackendStore } from "@/stores/backend";
import type { Socket } from "socket.io-client";

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
      cores: string;
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
      arch: string;
      type: string;
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
  init: (socket: Socket) => void;
};

export const useHealthStore = defineStore("health", (): HealthStore => {
  // state refs/reactive
  const state = ref<SystemInfo | undefined>(undefined);

  // For chartData, since it is nested and complex, use reactive
  const chartData = reactive({
    processMemory: {
      datasets: [
        ChartHelper.createEmptyDataSet({
          label: "Resident Set Size",
          color: { r: 0, g: 189, b: 126 },
          tension: 0,
        }),
        ChartHelper.createEmptyDataSet({
          label: "Heap total", color: { r: 0, g: 189, b: 126 }, tension: 0,
        }),
        ChartHelper.createEmptyDataSet({
          label: "Heap used",
          color: { r: 204, g: 0, b: 0 },
          tension: 0,
        }),
      ],
    } as ChartData<"line">,
    systemCpu: {
      datasets: [
        ChartHelper.createEmptyDataSet({
          label: "Percentage",
          color: { r: 0, g: 189, b: 126 },
          tension: 0,
        }),
      ],
    } as ChartData<"line">,
    systemMemory: {
      datasets: [
        ChartHelper.createEmptyDataSet({
          label: "Percentage",
          color: { r: 0, g: 189, b: 126 },
          tension: 0,
        }),
      ],
    } as ChartData<"line">,
  });

  // actions
  function init(socket: Socket): void {
    socket.on("healthMetrics", (data: SystemInfo) => {
      state.value = data;

      if (!chartData) {
        return;
      }

      chartData.processMemory.datasets[0].data.push({
        x: Date.now(),
        y: Number((data.process.memoryUsage.rss / 1024 / 1024).toFixed(2)),
      });
      chartData.processMemory.datasets[1].data.push({
        x: Date.now(),
        y: Number((data.process.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)),
      });
      chartData.processMemory.datasets[2].data.push({
        x: Date.now(),
        y: Number((data.process.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)),
      });

      chartData.systemCpu.datasets[0].data.push({
        x: Date.now(),
        y: Number(data.system.cpu.usage.toFixed(2)),
      });

      chartData.systemMemory.datasets[0].data.push({
        x: Date.now(),
        y: Number(data.system.memory.usedMemPercentage.toFixed(2)),
      });
    });
  }

  return {
    state,
    chartData,
    init,
  };
});
