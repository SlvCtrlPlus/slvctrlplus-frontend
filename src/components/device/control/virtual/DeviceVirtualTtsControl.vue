<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import { useRequiredSocketIO } from '@/plugins/vueSocketIOClient';
import DeviceCommunicator from '../../../../helper/DeviceCommunicator';
import type {VirtualDeviceTts} from '@/model/devices/virtual/VirtualDeviceTts';

interface Props {
  device: VirtualDeviceTts;
}

const props = defineProps<Props>();
const io = useRequiredSocketIO();

const deviceComm = new DeviceCommunicator(props.device, io);

const text = ref<string>(props.device.attributes.text.value ?? '');
const textAreaRef = ref();
const currentlySpeaking = computed<string>(() => {
  return undefined === props.device.attributes.speaking.value || !props.device.attributes.speaking.value
    ? 'no'
    : 'yes';
});

const sendTextHandler = (): void => {
  if (undefined === text.value || 0 === text.value.trim().length) {
    return;
  }
  deviceComm.setAttribute('text', text.value);
  text.value = '';
  nextTick(() => {
    textAreaRef.value?.focus();
  });
};
const changeQueuing = (newValue: boolean | null): void => {
  if (newValue !== null) {
    deviceComm.setAttribute('queuing', newValue);
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
  <v-row align="center" no-gutters>
    <v-col cols="auto">
      <v-btn color="primary" class="mt-4 mr-4" @click="sendTextHandler">send</v-btn>
    </v-col>
    <v-spacer />
    <v-col cols="auto">
      <v-switch
        :model-value="props.device.attributes.queuing.value"
        :hide-details="true"
        color="primary"
        class="pa-0 ma-0 mt-4 switch-label-left"
        label="Queuing disabled"
        @update:modelValue="changeQueuing"
      ></v-switch>
    </v-col>
  </v-row>

  <v-divider class="mt-4" />

  <dl v-if="true === props.device.attributes.queuing.value" class="mt-4 mb-4">
    <dt><label>Queue length</label></dt>
    <dd>
      <b>{{ props.device.attributes.queueLength.value || "empty" }}</b>
    </dd>
  </dl>
  <dl class="mt-4">
    <dt><label>Currently speaking</label></dt>
    <dd>
      <b>{{ currentlySpeaking }}</b>
    </dd>
  </dl>
</template>

<style scoped>
.switch-label-left :deep(.v-selection-control) {
  flex-direction: row-reverse;
  justify-content: flex-end;
  gap: 8px;
}
</style>
