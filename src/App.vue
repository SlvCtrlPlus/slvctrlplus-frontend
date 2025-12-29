<script setup lang="ts">
import { useDevicesStore } from "./stores/devices.js";
import { useSocketIO } from "./plugins/vueSocketIOClient.js";
import type { Socket } from "socket.io-client";
import type Device from "./model/devices/Device";
import { useSettingsStore } from "./stores/settings.js";
import { useAutomationStore } from "./stores/automation.js";
import { storeToRefs } from "pinia";
import { useAppStore } from "./stores/app";
import { useHealthStore } from "./stores/health";
import { useBackendStore } from "@/stores/backend";
import ServerStatusOverlay from "@/components/ServerStatusOverlay.vue";

const settingsStore = useSettingsStore();
const healthStore = useHealthStore();
const appStore = useAppStore();
const automationStore = useAutomationStore();
const devicesStore = useDevicesStore();
const backendStore = useBackendStore();

const { theme } = storeToRefs(settingsStore);

if (backendStore.backendUrl) {
  const io = useSocketIO() as Socket;

  io.on("connect", () => {
    backendStore.setServerOnline(true);

    // Init/update stores with initial data from server
    settingsStore.init();
    automationStore.init();
    devicesStore.init();
    healthStore.init();
  });
  io.on("disconnect", () => backendStore.setServerOnline(false));

  io.on("deviceDisconnected", (device) => {
    devicesStore.removeDevice(device);

    appStore.displaySnackbar(
      `Device "${(device as Device).deviceName}" (${
        (device as Device).type
      }) disconnected`
    );
  });
  io.on("deviceConnected", (device) => {
    devicesStore.addDevice(device);

    appStore.displaySnackbar(
      `Device "${(device as Device).deviceName}" (${
        (device as Device).type
      }) connected`
    );
  });
  io.on("deviceRefreshed", (device) => {
    devicesStore.updateDevice(device);
  });
  io.on("automationConsoleLog", (data: string) => {
    automationStore.logMessages.push(data);

    if (automationStore.logMessages.length > 500) {
      automationStore.logMessages.shift();
    }
  });
  io.on("settingsChanged", async () => {
    await settingsStore.getServerSettings()
  });
}
</script>

<template>
  <v-app :theme="theme" class="mx-auto overflow-hidden">
    <ServerStatusOverlay />
    <RouterView name="layout" />
    <RouterView />
  </v-app>
</template>

<style>
.v-toolbar-title {
  font-family: Impact, sans-serif;
}
</style>
