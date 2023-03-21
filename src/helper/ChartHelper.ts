import type { ChartDataset, ChartOptions, ScatterDataPoint } from "chart.js";
import type { Chart } from "chart.js";
import type { RealTimeScale } from "chartjs-plugin-streaming";

type rgb = { r: number; g: number; b: number };

export default abstract class ChartHelper {
  public static createStreamChartOptions(
    duration: number,
    refreshMs: number,
    delayMs: number,
    onRefresh: ((this: RealTimeScale, chart: Chart) => void | null)|null
  ): ChartOptions {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        point: {
          radius: 0,
          hoverRadius: 0,
        },
      },
      scales: {
        x: {
          type: "realtime",
          realtime: {
            duration: duration,
            refresh: refreshMs,
            delay: delayMs,
            onRefresh: onRefresh !== null ? onRefresh : () => { /* no-op */ },
          },
          display: false,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
        streaming: {
          pause: false,
        },
      },
    };
  }

  public static createEmptyDataSet(
    label: string,
    color: rgb,
    tension = 0.5
  ): ChartDataset<"line", (number | ScatterDataPoint | null)[]> {
    return {
      label: label,
      pointBackgroundColor: `rgba(${color.r}, ${color.g}, ${color.b})`,
      backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`,
      borderColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`,
      fill: "origin",
      tension: tension,
      data: [],
    };
  }

  public static pauseChart(options: ChartOptions): void {
    if (options.plugins?.streaming?.pause !== undefined) {
      options.plugins.streaming.pause = true;
    }
    if (options.plugins?.tooltip?.enabled !== undefined) {
      options.plugins.tooltip.enabled = true;
    }
    if (options.elements?.point !== undefined) {
      options.elements.point.radius = 1;
      options.elements.point.hoverRadius = 5;
    }
  }

  public static resumeChart(options: ChartOptions): void {
    if (options.plugins?.streaming?.pause !== undefined) {
      options.plugins.streaming.pause = false;
    }
    if (options.plugins?.tooltip?.enabled !== undefined) {
      options.plugins.tooltip.enabled = false;
    }
    if (options.elements?.point !== undefined) {
      options.elements.point.radius = 0;
      options.elements.point.hoverRadius = 0;
    }
  }
}
