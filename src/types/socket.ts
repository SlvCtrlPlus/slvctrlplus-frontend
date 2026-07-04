import type { Socket } from 'socket.io-client';
import type Device from '@/model/devices/Device';
import type { DeviceNotification } from '@/stores/deviceNotifications';

export interface SystemInfo {
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

export interface ServerToClientEvents {
  deviceConnected: (device: Device) => void;
  deviceDisconnected: (device: Device) => void;
  deviceRefreshed: (device: Device) => void;
  deviceNotification: (device: Device, notification: DeviceNotification) => void;
  automationConsoleLog: (data: string) => void;
  settingsChanged: () => void;
  healthMetrics: (data: SystemInfo) => void;
}

export interface ClientToServerEvents {
  deviceUpdate: (payload: { deviceId: string; data: Record<string, unknown> }) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
