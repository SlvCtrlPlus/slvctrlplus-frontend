<script setup lang="ts">
import type Device from "../model/Device.js";
import DeviceIcon from "./icons/DeviceIcon.vue";
import { computed, reactive } from "vue";

interface Props {
  device: Device;
}

const props = defineProps<Props>();
const device = reactive<Device>(props.device);

const lastRefreshed = computed<string>((): string => {
  return device.lastRefresh
    ? new Date(device.lastRefresh).toISOString()
    : "n/a";
});

const deviceTypeModel = computed<string>((): string => {
  return `${device.type} ${(device.type === 'generic') ? ` (model: ${device.deviceModel})` : ''}`;
});

function formatFwVersion(fwVersion: string): string {
  const bugfix = Number(fwVersion.slice(-2));
  const minor = Number(fwVersion.slice(-4, -2));
  const major = Number(fwVersion.slice(0, -4));

  return `${major}.${minor}.${bugfix}`;
}
</script>

<template>
  <v-card class="rounded-sm">
    <v-card-title>
      <DeviceIcon :device="device" class="icon" />
      {{ device.deviceName }}
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="pa-0">
      <v-list>
        <v-list-item>
          <v-list-item-title>ID</v-list-item-title>
          <v-list-item-subtitle
            v-text="device.deviceId"
          ></v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Type</v-list-item-title>
          <v-list-item-subtitle
            v-text="deviceTypeModel"
          ></v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Firmware</v-list-item-title>
          <v-list-item-subtitle
            v-text="formatFwVersion(device.fwVersion)"
          ></v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Connected since</v-list-item-title>
          <v-list-item-subtitle
            v-text="new Date(device.connectedSince).toISOString()"
          ></v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Last refresh</v-list-item-title>
          <v-list-item-subtitle v-text="lastRefreshed"></v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.icon {
  width: 1em;
  margin: 0 0.25em 0 0;
}
</style>
