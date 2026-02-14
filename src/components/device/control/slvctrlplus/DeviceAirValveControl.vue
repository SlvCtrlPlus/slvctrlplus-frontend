<script setup lang="ts">
import type {DeviceAirValve} from "@/model/devices/slvctrl/DeviceAirValve";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "../../../../helper/DeviceCommunicator";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";

interface Props {
  device: DeviceAirValve;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;
const deviceComm = new DeviceCommunicator(props.device, io);
</script>

<template>
  <dl>
    <dt><label>Flow</label></dt>
    <dd>
      <DebouncedSlider
        :model-value="props.device.attributes.flow.value"
        @update:model-value="value => deviceComm.setAttribute('flow', value)"
        :attribute="props.device.attributes.flow"
        :slider-debounce="50"
        :input-debounce="100"
      />
    </dd>
  </dl>
  <v-divider class="my-4"></v-divider>
  <div>
    <v-btn color="grey-darken-3" class="mr-4" @click="deviceComm.setAttribute('flow', 100)"
      >open</v-btn
    >
    <v-btn color="grey-darken-3" @click="deviceComm.setAttribute('flow', 0)">close</v-btn>
  </div>
</template>
