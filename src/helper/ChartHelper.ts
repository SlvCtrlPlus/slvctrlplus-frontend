import type {ChartData, ChartDataset, ChartOptions, LineOptions, ScatterDataPoint} from "chart.js";
import type { Chart } from "chart.js";
import type { RealTimeScale } from "chartjs-plugin-streaming";

export type LineChartOptions = ChartOptions<'line'>;
export type LineChartData = ChartData<'line'>;

export type Color = { r: number; g: number; b: number };

type DatasetOptions = {
  label: string,
  color: Color,
  densityLine?: number,
  densityBackground?: number,
  tension?: number,
  fill?: boolean,
  stack?: string,
  spanGaps?: number,
  segment?: Partial<LineOptions['segment']>,
  borderDash?: LineOptions['borderDash'],
}

export default abstract class ChartHelper {
  public static createStreamChartOptions(
    duration: number,
    refreshMs: number,
    delayMs: number,
    onRefresh: ((this: RealTimeScale, chart: Chart) => void | null) | null
  ): LineChartOptions {
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
    options: DatasetOptions
  ): ChartDataset<"line", (number | ScatterDataPoint | null)[]> {
    const densityLine = options.densityLine ?? 0.5;
    const densityBackground = options.densityBackground ?? 0.1;

    return {
      label: options.label,
      pointBackgroundColor: `rgba(${options.color.r}, ${options.color.g}, ${options.color.b})`,
      backgroundColor: `rgba(${options.color.r}, ${options.color.g}, ${options.color.b}, ${densityBackground})`,
      borderColor: `rgba(${options.color.r}, ${options.color.g}, ${options.color.b}, ${densityLine})`,
      fill: options.fill ?? "origin",
      tension: options.tension ?? 0.5,
      spanGaps: options.spanGaps ?? undefined,
      stack: options.stack ?? undefined,
      segment: options.segment ?? undefined,
      borderDash: options.borderDash ?? undefined,
      data: [],
    };
  }

  public static pauseChart(options: LineChartOptions): void {
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

  public static resumeChart(options: LineChartOptions): void {
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

  public static getY(v: number | ScatterDataPoint | null): number | undefined {
    if (v == null) return undefined;
    if (typeof v === 'number') return v;
    if (typeof v === 'object') return v.y;
    return undefined;
  }

  public static getCssColor(color: Color, alpha: number = 1) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }
}
