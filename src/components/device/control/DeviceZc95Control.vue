<script setup lang="ts">
import { reactive, computed } from "vue";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "@/helper/DeviceCommunicator";
import type {DeviceZc95} from "@/model/DeviceZc95";
import {getDeviceAttribute} from "@/model/DeviceGeneric";
import type DeviceZc95Data from "@/model/DeviceZc95Data";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";

interface Props {
  device: DeviceZc95;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const device = reactive<DeviceZc95>(props.device);

const deviceComm = new DeviceCommunicator(props.device, io);

const attrChangeHandler = (
  attrName: keyof DeviceZc95Data,
  value: string | number | boolean
): void => {
  deviceComm.setAttribute(attrName, value);
};

// Get all slider attributes (powerChannels + patternAttributes) sorted
const sliderAttributes = computed(() => {
  if (!device.data) return { powerChannels: [], patternAttributes: [] };

  const allKeys = Object.keys(device.data)
    .filter(key => key.startsWith('powerChannel') || key.startsWith('patternAttribute'));

  const powerChannels = allKeys
    .filter(key => key.startsWith('powerChannel'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('powerChannel', ''));
      const numB = parseInt(b.replace('powerChannel', ''));
      return numA - numB;
    })
    .map(key => getDeviceAttribute(device, key as keyof DeviceZc95Data))
    .filter(attr => attr !== undefined);

  const patternAttributes = allKeys
    .filter(key => key.startsWith('patternAttribute'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('patternAttribute', ''));
      const numB = parseInt(b.replace('patternAttribute', ''));
      return numA - numB;
    })
    .map(key => getDeviceAttribute(device, key as keyof DeviceZc95Data))
    .filter(attr => attr !== undefined);

  return { powerChannels, patternAttributes };
});
</script>

<template>
  <v-select
    v-model="device.data.activePattern"
    :items="Object.entries(getDeviceAttribute(device, 'activePattern')?.values || {}).map(([key, value]) => ({ title: value, value: parseInt(key) }))"
    label="Mode"
    hide-details
    @update:modelValue="value => attrChangeHandler('activePattern', value)"
  ></v-select>
  <v-btn :color="(!device.data.patternStarted ? 'primary' : 'red')" class="mt-4" @click="() => attrChangeHandler('patternStarted', !device.data.patternStarted)"
  ><span v-if="!device.data.patternStarted">start</span><span v-else>stop</span></v-btn >

  <div v-if="device.data.patternStarted">
    <!-- Power Channels -->
    <div v-if="sliderAttributes.powerChannels.length > 0">
      <v-divider class="my-4" />
      <dl :key="attr.name" v-for="attr in sliderAttributes.powerChannels">
        <dt>
          <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
        </dt>
        <dd>
          <DebouncedSlider
            :model-value="device.data[attr.name as keyof DeviceZc95Data] as number"
            @update:model-value="value => attrChangeHandler(attr.name as keyof DeviceZc95Data, value)"
            :attribute="attr"
            :disabled="!device.data.patternStarted"
            :slider-debounce="50"
            :input-debounce="100"
          />
        </dd>
      </dl>
    </div>

    <!-- Pattern Attributes -->
    <div v-if="sliderAttributes.patternAttributes.length > 0">
      <v-divider class="my-4" />
      <dl :key="attr.name" v-for="attr in sliderAttributes.patternAttributes">
        <dt>
          <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
        </dt>
        <dd>
          <DebouncedSlider
            :model-value="device.data[attr.name as keyof DeviceZc95Data] as number"
            @update:model-value="value => attrChangeHandler(attr.name as keyof DeviceZc95Data, value)"
            :attribute="attr"
            :disabled="!device.data.patternStarted"
            :slider-debounce="50"
            :input-debounce="100"
          />
        </dd>
      </dl>
    </div>
  </div>
</template>

<style scoped></style>
