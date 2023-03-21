import { defineStore } from "pinia";
import type { ChartData } from "chart.js";
import ChartHelper from "../helper/ChartHelper";

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

export type HealthState = {
  state: SystemInfo | undefined;
  chartData: {
    processMemory: ChartData<"line">;
    systemMemory: ChartData<"line">;
    systemCpu: ChartData<"line">;
  };
};

export const useHealthStore = defineStore({
  id: "health",
  state: () => {
    return {
      state: undefined,
      chartData: {
        processMemory: {
          datasets: [
            ChartHelper.createEmptyDataSet("Resident Set Size", { r: 0, g: 189, b: 126 }, 0),
            ChartHelper.createEmptyDataSet("Heap total", { r: 0, g: 189, b: 126 }, 0),
            ChartHelper.createEmptyDataSet("Heap used", { r: 204, g: 0, b: 0 }, 0),
          ],
        },
        systemCpu: {
          datasets: [ChartHelper.createEmptyDataSet("Percentage", { r: 0, g: 189, b: 126 }, 0)],
        },
        systemMemory: {
          datasets: [ChartHelper.createEmptyDataSet("Percentage", { r: 0, g: 189, b: 126 }, 0)],
        },
      },
    } as HealthState;
  },
  actions: {
    init(): void {
      setInterval(async () => {
        const response = await fetch(`http://${location.hostname}:1337/health`);
        this.state = await response.json();
      }, 500);

      setInterval(async () => {
        if (this.chartData === undefined || this.state === undefined) {
          return;
        }

        this.chartData.processMemory.datasets[0].data.push({
          x: Date.now(),
          y: Number(
            (this.state.process.memoryUsage.rss / 1024 / 1024).toFixed(2)
          ),
        });
        this.chartData.processMemory.datasets[1].data.push({
          x: Date.now(),
          y: Number(
            (this.state.process.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)
          ),
        });
        this.chartData.processMemory.datasets[2].data.push({
          x: Date.now(),
          y: Number(
            (this.state.process.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
          ),
        });

        this.chartData.systemCpu.datasets[0].data.push({
          x: Date.now(),
          y: Number(this.state.system.cpu.usage.toFixed(2)),
        });

        this.chartData.systemMemory.datasets[0].data.push({
          x: Date.now(),
          y: Number(this.state.system.memory.usedMemPercentage.toFixed(2)),
        });
      }, 425);
    },
  },
});
