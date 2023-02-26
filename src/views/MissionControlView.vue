<script setup lang="ts">
import DeviceIcon from "../components/icons/DeviceIcon.vue";
import DeviceControl from "../components/device/DeviceControl.vue";
import LoadingState from "../components/LoadingState.vue";
import { useDevicesStore } from "../stores/devices.js";
import { storeToRefs } from "pinia";
import EmptyState from "../components/EmptyState.vue";

const devicesStore = useDevicesStore();
const { devicesLoaded, deviceList } = storeToRefs(devicesStore);
</script>

<template>
  <v-container v-if="devicesLoaded" fluid class="px-8 fill-height">
    <h2 class="text-h4 text-grey-darken-1 py-4">Mission control</h2>
    <v-container v-if="deviceList.length > 0" fluid grid-list-md class="px-0">
      <v-row row wrap>
        <v-col cols="12" xs="12" sm="6" md="4" v-for="device in deviceList" xs4>
          <v-card class="rounded-sm">
            <v-card-title>
              <DeviceIcon :device="device" class="icon" />
              {{ device.deviceName }}
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <DeviceControl :device="device" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <EmptyState
      v-else
      msg="Currently no connected devices"
      icon="mdi-emoticon-sad-outline"
    />
  </v-container>
  <LoadingState v-else msg="Getting devices" />
</template>

<style scoped>
.icon {
  width: 1em;
  margin: 0 0.25em 0 0;
}
</style>
