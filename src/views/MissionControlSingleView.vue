<script setup lang="ts">
import LoadingState from "../components/LoadingState.vue";
import { useDevicesStore } from "@/stores/devices.js";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import {ref, watch, nextTick, ComponentPublicInstance} from "vue";
import type Device from "@/model/devices/Device";
import DeviceCard from "@/components/device/DeviceCard.vue";

const devicesStore = useDevicesStore();
const { devicesLoaded, deviceList } = storeToRefs(devicesStore);

const route = useRoute();

const device = ref<Device | null | undefined>(null);
const containerRef = ref<ComponentPublicInstance | undefined>(undefined);

function resizeToContent() {
  nextTick(() => {
    setTimeout(() => {
      if (undefined === containerRef.value) {
        return;
      }
      const el = containerRef.value.$el;
      // Temporarily remove fill-height and d-flex classes
      const removedClasses = removeClasses(el, ["fill-height", "d-flex"]);
      // Measure height
      const height = el.scrollHeight;
      const browserOverheadHeight = window.outerHeight - window.innerHeight;
      window.resizeTo(window.outerWidth, height + browserOverheadHeight);
      // Restore classes
      el.classList.add(...removedClasses);
    }, 100); // Longer delay for async rendering/layout
  });
}

function removeClasses(el: HTMLElement, classesToRemove: string[]): string[] {
  const removedClasses: string[] = [];

  classesToRemove.forEach(cls => {
    if (el.classList.contains(cls)) {
      el.classList.remove(cls);
      removedClasses.push(cls);
    }
  });

  return removedClasses;
}

watch(
  [() => route.params.id, deviceList],
  async ([newId]) => {
    device.value = deviceList.value.find((d) => d.deviceId === newId);
    resizeToContent();
  },
  { immediate: true }
);
</script>

<template>
  <v-container
    ref="containerRef"
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
    v-else-if="devicesLoaded && device === undefined"
    :msg="`Could not find device with id: ${route.params.id}`"
  />
  <LoadingState v-else msg="Loading device details" />
</template>

<style scoped></style>
