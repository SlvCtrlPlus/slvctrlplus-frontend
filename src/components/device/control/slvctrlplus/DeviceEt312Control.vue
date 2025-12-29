<script setup lang="ts">
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "@/helper/DeviceCommunicator";
import {DeviceEt312} from "@/model/devices/slvctrl/DeviceEt312";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";

interface Props {
  device: DeviceEt312;
}

type SelectItem = {
  value: number;
  title: string;
};

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const modes: { [key: number]: string } = {
  0x76: "Waves",
  0x77: "Stroke",
  0x78: "Climb",
  0x79: "Combo",
  0x7a: "Intense",
  0x7b: "Rhythm",
  0x7c: "Audio 1",
  0x7d: "Audio 2",
  0x7e: "Audio 3",
  0x7f: "Split",
  0x80: "Random 1",
  0x81: "Random 2",
  0x82: "Toggle",
  0x83: "Orgasm",
  0x84: "Torment",
  0x85: "Phase 1",
  0x86: "Phase 2",
  0x87: "Phase 3",
  0x88: "User 1",
  0x89: "User 2",
  0x8a: "User 3",
  0x8b: "User 4",
  0x8c: "User 5",
};

const selectModes: SelectItem[] = [];

for (const modeKey in modes) {
  selectModes.push({ value: +modeKey, title: modes[modeKey] });
}

const deviceComm = new DeviceCommunicator(props.device, io);

const adcChangeHandler = (newAdc: boolean | null): void =>
  deviceComm.setAttribute("adc", newAdc ?? false);

const levelChangeHandler = (channel: string, level: number): void =>
  deviceComm.setAttribute("level" + channel.toUpperCase(), level);

const levelChangeHandlerA = (level: number): void =>
  levelChangeHandler("A", level);
const levelChangeHandlerB = (level: number): void =>
  levelChangeHandler("B", level);

const modeChangeHandler = (newMode: number): void =>
  deviceComm.setAttribute("mode", newMode);
</script>

<template>
  <div v-if="props.device.attributes.connected.value && props.device.attributes.mode.value !== 0">
    <v-select
      :model-value="props.device.attributes.mode.value"
      :items="selectModes"
      label="Mode"
      hide-details
      @update:modelValue="modeChangeHandler"
    ></v-select>
    <v-checkbox
      :model-value="props.device.attributes.adc.value"
      :true-value="false"
      :false-value="true"
      label="Control levels"
      color="primary"
      :hide-details="true"
      class="pa-0 ma-0"
      @update:modelValue="adcChangeHandler"
    ></v-checkbox>
    <div class="levels">
      <dl>
        <dt><label>Level A</label></dt>
        <dd>
          <DebouncedSlider
            :model-value="props.device.attributes.levelA.value"
            @update:model-value="levelChangeHandlerA"
            :attribute="props.device.attributes.levelA"
            :disabled="props.device.attributes.adc.value || undefined === props.device.attributes.levelA.value"
            :slider-debounce="50"
            :input-debounce="100"
          />
        </dd>
      </dl>
      <dl>
        <dt><label>Level B</label></dt>
        <dd>
          <DebouncedSlider
            :model-value="props.device.attributes.levelB.value"
            @update:model-value="levelChangeHandlerB"
            :attribute="props.device.attributes.levelB"
            :disabled="props.device.attributes.adc.value || undefined === props.device.attributes.levelB.value"
            :slider-debounce="50"
            :input-debounce="100"
          />
        </dd>
      </dl>
    </div>
  </div>
  <v-alert
    v-else-if="props.device.attributes.connected.value && 0 === props.device.attributes.mode.value"
    icon="mdi-alert"
    color="grey-darken-3"
    class="text-grey-darken-4"
    dark
    >Press OK on the MK/ET-312 device</v-alert
  >
  <v-alert
    v-else
    icon="mdi-alert"
    color="grey-darken-3"
    class="text-grey-darken-4"
    dark
    >No MK/ET-312 connected</v-alert
  >
</template>

<style scoped></style>
