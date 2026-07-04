<script setup lang="ts">
import { reactive } from 'vue';
import { useRequiredSocketIO } from '@/plugins/vueSocketIOClient';
import DeviceCommunicator from '@/helper/DeviceCommunicator';
import type {DeviceStrikerMk2} from '@/model/devices/slvctrl/DeviceStrikerMk2';
import DebouncedSlider from '@/components/device/DebouncedSlider.vue';

interface Props {
  device: DeviceStrikerMk2;
}

const props = defineProps<Props>();
const io = useRequiredSocketIO();

const deviceComm = new DeviceCommunicator(props.device, io);
const device = reactive<DeviceStrikerMk2>(props.device);

const speedChangeHandler = (newSpeed: number): void => {
  deviceComm.setAttribute('speed', newSpeed);
};
</script>

<template>
  <dl>
    <dt><label>Speed</label></dt>
    <dd>
      <DebouncedSlider
          :model-value="device.attributes.speed.value"
          @update:model-value="speedChangeHandler"
          :attribute="device.attributes.speed"
          :disabled="!props.device.attributes.speed.value"
          :slider-debounce="50"
          :input-debounce="100"
      />
    </dd>
  </dl>
</template>

<style></style>
