<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useSocketIO } from "../../../plugins/vueSocketIOClient.js";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "../../../helper/DeviceCommunicator";
import type VirtualDeviceTts from "../../../model/virtual/VirtualDeviceTts.js";

interface Props {
  device: VirtualDeviceTts;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const device = reactive<VirtualDeviceTts>(props.device);
const deviceComm = new DeviceCommunicator(props.device, io);

const text = ref<string>(device.data?.text || "");
const currentlySpeaking = computed<string>(() => {
  return undefined === device.data?.speaking || false === device.data?.speaking
    ? "no"
    : "yes";
});
const queuingLabel = computed<string>(() => {
  return device.data?.queuing
    ? `Queuing enabled (Queue: ${device.data.queueLength})`
    : "Queuing disabled";
});

const sendTextHandler = (): void => {
  if (undefined === text.value || 0 === text.value.trim().length) {
    return;
  }
  deviceComm.setAttribute("text", text.value);
  text.value = "";
};
const changeQueuing = (newValue: boolean): void =>
  deviceComm.setAttribute("queuing", newValue);
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
    v-model="device.data.queuing"
    hide-details="hide-details"
    color="primary"
    class="pa-0 ma-0"
    :label="queuingLabel"
    @update:modelValue="changeQueuing"
  ></v-switch>

  <dl v-if="true === device.data?.queuing" class="mt-4 mb-4">
    <dt><label>Queue length</label></dt>
    <dd>
      <b>{{ device.data?.queueLength || "empty" }}</b>
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
