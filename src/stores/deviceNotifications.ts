import { defineStore } from 'pinia';
import { ref } from 'vue';
import type Device from '@/model/devices/Device';

export type DeviceNotification = {
    type: string;
    data: Record<string, unknown>;
};

export type DeviceNotificationEvent = {
    device: Device;
    notification: DeviceNotification;
    timestamp: number;
};

export const useDeviceNotificationsStore = defineStore('deviceNotifications', () => {
    // Map of deviceId -> latest notification event
    const latest = ref<Record<string, DeviceNotificationEvent>>({});

    function dispatch(device: Device, notification: DeviceNotification): void {
        latest.value[device.deviceId] = { device, notification, timestamp: Date.now() };
    }

    function getLatest(deviceId: string): DeviceNotificationEvent | undefined {
        return latest.value[deviceId];
    }

    function remove(deviceId: string): void {
        delete latest.value[deviceId];
    }

    function clear(): void {
        latest.value = {};
    }

    return {
        latest,
        dispatch,
        getLatest,
        remove,
        clear,
    };
});
