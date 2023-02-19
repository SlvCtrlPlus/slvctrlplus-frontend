<script setup lang="ts">
import type DeviceAirValve from "../../../model/DeviceAirValve";
import { reactive } from "vue";
import { useSocketIO } from "../../../plugins/vueSocketIOClient.js";
import type { Socket } from "socket.io-client";

interface Props {
  device: DeviceAirValve;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const device = reactive<DeviceAirValve>(props.device);

const flowChangeHandler = (newFlow: number): void => {
  props.device.receiveUpdates = false;
  io.emit("deviceUpdate", {
    deviceId: props.device.deviceId,
    data: { flow: newFlow },
  });
  setTimeout(() => (props.device.receiveUpdates = true), 500);
};
</script>

<template>
  <dl>
    <dt><label>Flow</label></dt>
    <dd>
      <v-slider
        v-model="device.data.flow"
        max="100"
        min="0"
        step="1"
        hide-details
        color="primary"
        class="ma-0 ml-2"
        @update:modelValue="flowChangeHandler"
      >
        <template v-slot:append>
          <v-text-field
            v-model="device.data.flow"
            hide-details
            single-line
            max="100"
            min="0"
            density="compact"
            variant="outlined"
            type="number"
            style="width: 80px"
            @update:modelValue="flowChangeHandler"
          ></v-text-field>
        </template>
      </v-slider>
    </dd>
  </dl>
  <v-divider class="my-4"></v-divider>
  <div>
    <v-btn color="grey-darken-3" class="mr-4" @click="flowChangeHandler(100)"
      >open</v-btn
    >
    <v-btn color="grey-darken-3" @click="flowChangeHandler(0)">close</v-btn>
  </div>
</template>
