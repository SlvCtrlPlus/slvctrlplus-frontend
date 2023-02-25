<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type DeviceStrikerMk2 from "../../../model/DeviceStrikerMk2.js";
import type { Socket } from "socket.io-client";
import { useSocketIO } from "../../../plugins/vueSocketIOClient.js";
import DeviceCommunicator from "../../../helper/DeviceCommunicator";

interface Props {
  device: DeviceStrikerMk2;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device, io);
const device = reactive<DeviceStrikerMk2>(props.device);

const speedChangeHandler = (newSpeed: number): void =>
  deviceComm.setAttribute("speed", newSpeed);
</script>

<template>
  <dl>
    <dt><label>Speed</label></dt>
    <dd>
      <v-slider
        v-model="device.data.speed"
        @update:modelValue="speedChangeHandler"
        max="100"
        min="0"
        step="1"
        label="Speed"
        hide-details
        color="primary"
      >
        <template v-slot:append>
          <v-text-field
            v-model="device.data.speed"
            @update:modelValue="speedChangeHandler"
            hide-details
            single-line
            max="100"
            min="0"
            density="compact"
            variant="outlined"
            type="number"
            style="width: 80px"
          ></v-text-field>
        </template>
      </v-slider>
    </dd>
  </dl>
</template>

<style></style>
