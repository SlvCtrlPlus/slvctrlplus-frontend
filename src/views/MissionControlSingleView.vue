<script setup lang="ts">
import LoadingState from "../components/LoadingState.vue";
import { useDevicesStore } from "../stores/devices.js";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { ref, watch } from "vue";
import type Device from "../model/Device";
import DeviceCard from "../components/device/DeviceCard.vue";

const devicesStore = useDevicesStore();
const { devicesLoaded, deviceList } = storeToRefs(devicesStore);

const route = useRoute();

const device = ref<Device | null | undefined>(undefined);

updateDevice(route.params.id as string);

watch(
  () => route.params.id,
  (newId) => updateDevice(newId as string)
);

function updateDevice(deviceId: string) {
  device.value = deviceList.value.find((d) => d.deviceId === deviceId);
}
</script>

<template>
  <v-container
    v-if="devicesLoaded && device !== undefined && device !== null"
    fluid
    class="d-flex fill-height pa-0 ma-0"
  >
    <DeviceCard
      :device="device"
      :render-popup-link="false"
      width="100%"
      height="100%"
    />
  </v-container>
  <LoadingState
    v-else-if="device === null"
    :msg="`Could not find device with id: ${route.params.id}`"
  />
  <LoadingState v-else msg="Loading device details" />
</template>

<style scoped>
</style>
