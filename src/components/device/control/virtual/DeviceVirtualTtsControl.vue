<script setup lang="ts">
import { computed, ref } from "vue";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "../../../../helper/DeviceCommunicator";
import {VirtualDeviceTts} from "@/model/devices/virtual/VirtualDeviceTts";

interface Props {
  device: VirtualDeviceTts;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device, io);

const text = ref<string>(props.device.attributes.text.value ?? "");
const currentlySpeaking = computed<string>(() => {
  return undefined === props.device.attributes.speaking.value || !props.device.attributes.speaking.value
    ? "no"
    : "yes";
});
const queuingLabel = computed<string>(() => {
  return props.device.attributes.queuing
    ? `Queuing enabled (Queue: ${props.device.attributes.queueLength.value})`
    : "Queuing disabled";
});

const sendTextHandler = (): void => {
  if (undefined === text.value || 0 === text.value.trim().length) {
    return;
  }
  deviceComm.setAttribute("text", text.value);
  text.value = "";
};
const changeQueuing = (newValue: boolean | null): void => {
  if (newValue !== null) {
    deviceComm.setAttribute("queuing", newValue);
  }
};
</script>

<template>
  <v-textarea
    v-model="text"
    label="Enter text to speech"
    color="primary"
    class="pa-0 ma-0"
    type="text"
    hide-details
  ></v-textarea
  ><v-btn color="primary" class="mt-4 mr-4" @click="sendTextHandler"
    >send</v-btn
  >

  <v-switch
    v-model="device.attributes.queuing.value"
    :hide-details="true"
    color="primary"
    class="pa-0 ma-0"
    :label="queuingLabel"
    @update:modelValue="changeQueuing"
  ></v-switch>

  <dl v-if="true === device.attributes.queuing.value" class="mt-4 mb-4">
    <dt><label>Queue length</label></dt>
    <dd>
      <b>{{ device.attributes.queueLength.value || "empty" }}</b>
    </dd>
  </dl>
  <dl class="mt-4">
    <dt><label>Currently speaking</label></dt>
    <dd>
      <b>{{ currentlySpeaking }}</b>
    </dd>
  </dl>
</template>

<style scoped></style>
