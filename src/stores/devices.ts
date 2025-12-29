import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import {apiFetch} from "@/utils/apiFetch";
import type Device from "@/model/devices/Device";

export const useDevicesStore = defineStore("devices", () => {
  // State: use reactive for objects, ref for primitives
  const devices = reactive<{ [key: string]: Device }>({});
  const devicesLoaded = ref(false);

  // Getter
  const deviceList = computed(() => Object.values(devices));

  // Actions
  function init() {
    apiFetch(`/devices`)
        .then((response) => response.json())
        .then((data) => {
          data.items.forEach((v: Device) => {
            v.receiveUpdates = true;
            devices[v.deviceId] = v;
          });
          devicesLoaded.value = true;
        })
        .catch(console.log);
  }

  function removeDevice(removedDevice: Device) {
    delete devices[removedDevice.deviceId];
  }

  function addDevice(device: Device) {
    device.receiveUpdates = true;
    devices[device.deviceId] = device;
  }

  function updateDevice(updatedDevice: Device) {
    const device = devices[updatedDevice.deviceId];
    if (!device || !device.receiveUpdates) {
      return;
    }

    device.lastRefresh = updatedDevice.lastRefresh;

    if ('attributes' in device && 'attributes' in updatedDevice) {
      device.attributes = updatedDevice.attributes;
    }
  }

  return {
    devices,
    devicesLoaded,
    deviceList,
    init,
    removeDevice,
    addDevice,
    updateDevice,
  };
});
