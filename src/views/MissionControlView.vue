<script setup lang="ts">
import { storeToRefs } from "pinia";
import LoadingState from "@/components/LoadingState.vue";
import { useDevicesStore } from "@/stores/devices";
import EmptyState from "@/components/EmptyState.vue";
import DeviceCard from "@/components/device/DeviceCard.vue";

const devicesStore = useDevicesStore();
const { devicesLoaded, deviceList } = storeToRefs(devicesStore);
</script>

<template>
  <v-container
    v-if="devicesLoaded"
    fluid
    class="px-sm-6 d-flex align-start flex-column fill-height"
  >
    <h2 class="text-h4 text-grey-darken-1 py-4 flex-shrink-0 flex-grow-0">
      Mission control
    </h2>
    <v-container fluid class="pa-0">
      <v-container v-if="deviceList.length > 0" fluid grid-list-md class="px-0">
        <div class="masonry">
          <v-sheet
            class="masonry-item"
            v-for="device in deviceList"
            :key="device.deviceId"
          >
            <DeviceCard :device="device" :render-popup-link="true" />
          </v-sheet>
        </div>
      </v-container>
      <EmptyState
        v-else
        msg="Currently no connected devices"
        icon="mdi-emoticon-sad-outline"
      />
    </v-container>
  </v-container>
  <LoadingState v-else msg="Loading connected devices" />
</template>

<style scoped>
.masonry {
  column-count: 4;
  column-gap: 1rem;
  width: 100%;
}

@media (max-width: 1264px) {
  .masonry {
    column-count: 3;
  }
}
@media (max-width: 960px) {
  .masonry {
    column-count: 2;
  }
}
@media (max-width: 600px) {
  .masonry {
    column-count: 1;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
  width: 100%; /* Critical for columns */
  display: inline-block; /* Required for masonry layout */
}
</style>
