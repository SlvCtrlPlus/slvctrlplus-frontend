<script setup lang="ts">
import LoadingState from "../components/LoadingState.vue";
import { useDevicesStore } from "../stores/devices.js";
import { storeToRefs } from "pinia";
import EmptyState from "../components/EmptyState.vue";
import DeviceInfo from "../components/DeviceInfo.vue";

const devicesStore = useDevicesStore();
const { deviceList, devicesLoaded } = storeToRefs(devicesStore);
</script>

<template>
  <v-container
    v-if="devicesLoaded"
    fluid
    class="px-sm-6 d-flex align-start flex-column fill-height"
  >
    <h2 class="text-h4 text-grey-darken-1 py-4 flex-shrink-0 flex-grow-0">
      Connected devices
      <v-chip pill color="primary">{{ deviceList.length }}</v-chip>
    </h2>
    <v-container fluid class="pa-0 flex-shrink-0 flex-grow-1">
      <v-container v-if="deviceList.length > 0" fluid grid-list-md class="px-0">
        <v-row row wrap>
          <v-col
            cols="12"
            sm="12"
            md="6"
            lg="4"
            xl="3"
            :key="device.deviceId"
            v-for="device in deviceList"
            xs4
          >
            <DeviceInfo :device="device" />
          </v-col>
        </v-row>
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
