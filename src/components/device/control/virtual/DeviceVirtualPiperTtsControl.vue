<script setup lang="ts">
import { computed, ref, nextTick } from "vue";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "../../../../helper/DeviceCommunicator";
import type {VirtualDevicePiperTts} from "@/model/devices/virtual/VirtualDevicePiperTts";

interface Props {
  device: VirtualDevicePiperTts;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device, io);

const text = ref<string>(props.device.attributes.text.value ?? "");
const textAreaRef = ref();
const queuingLabel = computed<string>(() => props.device.attributes.queuing.value
    ? 'Queuing enabled'
    : 'Queuing disabled'
);

const sendTextHandler = (): void => {
  if (undefined === text.value || 0 === text.value.trim().length) {
    return;
  }
  deviceComm.setAttribute("text", text.value);
  text.value = "";
  nextTick(() => {
    textAreaRef.value?.focus();
  });
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
    ref="textAreaRef"
    label="Enter text to speech"
    color="primary"
    class="pa-0 ma-0"
    type="text"
    hide-details
  ></v-textarea>
  <v-btn color="primary" class="mt-4 mr-4" @click="sendTextHandler">send</v-btn>

  <v-switch
    :model-value="props.device.attributes.queuing.value"
    :hide-details="true"
    color="primary"
    class="pa-0 ma-0"
    :label="queuingLabel"
    @update:modelValue="changeQueuing"
  ></v-switch>
</template>

<style scoped></style>
