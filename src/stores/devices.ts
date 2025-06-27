import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import type Device from "../model/Device.js";
import type DeviceGeneric from "../model/DeviceGeneric.js";

export const useDevicesStore = defineStore("devices", () => {
  // State: use reactive for objects, ref for primitives
  const devices = reactive<{ [key: string]: Device }>({});
  const devicesLoaded = ref(false);

  // Getter
  const deviceList = computed(() => Object.values(devices));

  // Actions
  function init() {
    fetch(`http://${location.hostname}:1337/devices`)
        .then((response) => response.json())
        .then((data) => {
          data.items.forEach((v: Device) => {
            v.receiveUpdates = true;
            devices[v.deviceId as string] = v;
          });
          devicesLoaded.value = true;
        })
        .catch(console.log);
  }

  function removeDevice(removedDevice: Device) {
    delete devices[removedDevice.deviceId as string];
  }

  function addDevice(device: Device) {
    device.receiveUpdates = true;
    devices[device.deviceId as string] = device;
  }

  function updateDevice(updatedDevice: Device) {
    const device = devices[updatedDevice.deviceId as string];
    if (!device || !device.receiveUpdates) {
      return;
    }
    device.lastRefresh = updatedDevice.lastRefresh;

    if (device.type === "slvCtrlPlus") {
      (device as DeviceGeneric).data = (updatedDevice as DeviceGeneric).data;
    } else if (device.type === "buttplugIo") {
      (device as DeviceGeneric).data = (updatedDevice as DeviceGeneric).data;
    } else {
      (device as DeviceGeneric).data = (updatedDevice as DeviceGeneric).data;
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
