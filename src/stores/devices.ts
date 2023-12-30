import { defineStore } from "pinia";
import type Device from "../model/Device.js";
import type DeviceGeneric from "../model/DeviceGeneric.js";

export type DeviceState = {
  devices: { [key: string]: Device };
  devicesLoaded: boolean;
};

export const useDevicesStore = defineStore({
  id: "devices",
  state: () =>
    ({
      devices: {},
      devicesLoaded: false,
    } as DeviceState),
  getters: {
    deviceList: (state) => Object.values(state.devices),
  },
  actions: {
    init() {
      fetch(`http://${location.hostname}:1337/devices`)
        .then((response) => response.json())
        .then((data) => {
          data.items.forEach((v: Device) => {
            v.receiveUpdates = true;
            this.devices[v.deviceId as string] = v;
          });
          this.devicesLoaded = true;
        })
        .catch(console.log);
    },
    removeDevice(removedDevice: Device) {
      delete this.devices[removedDevice.deviceId as string];
    },
    addDevice(device: Device) {
      device.receiveUpdates = true;
      this.devices[device.deviceId as string] = device;
    },
    updateDevice(updatedDevice: Device) {
      const device = this.devices[updatedDevice.deviceId as string];

      if (!device || !device.receiveUpdates) {
        return;
      }

      device.lastRefresh = updatedDevice.lastRefresh;

      if (device.type === "slvCtrlPlus") {
        (device as DeviceGeneric).data = (updatedDevice as DeviceGeneric).data;
      } else if (device.type === "buttplugIo") {
        (device as DeviceGeneric).data = (updatedDevice as DeviceGeneric).data;
      } else {
        console.log(
          `Device update for unhandled device of type: ${updatedDevice.type} (${updatedDevice.deviceName})`
        );
      }
    },
  },
});
