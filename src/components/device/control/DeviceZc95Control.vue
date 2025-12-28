<script setup lang="ts">
import { computed } from "vue";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "@/helper/DeviceCommunicator";
import type {
  DeviceZc95,
  PatternDeviceZc95Attributes,
  PowerChannelDeviceZc95Attributes
} from "@/model/devices/zc95/DeviceZc95";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";
import {DeviceData} from "@/model/devices/Device";
import {isIntRangeDeviceAttribute, isListDeviceAttribute, typedEntries} from "@/utils/utils";

interface Props {
  device: DeviceZc95;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device, io);

const attrChangeHandler = (
  attrName: keyof DeviceData<DeviceZc95>,
  value: string | number | boolean
): void => {
  deviceComm.setAttribute(attrName, value);
};

// Get all slider attributes (powerChannels + patternAttributes) sorted
const sliderAttributes = computed(() => {
  const powerChannelAttributes = Object.fromEntries(
      Object.entries(props.device.attributes).filter(([key]) => key.startsWith('powerChannel'))
  ) as PowerChannelDeviceZc95Attributes;

  const patternAttributes = Object.fromEntries(
      Object.entries(props.device.attributes).filter(([key]) => key.startsWith('patternAttribute'))
  ) as PatternDeviceZc95Attributes;

  return { powerChannelAttributes, patternAttributes };
});

const activePatternItems = computed(() => {
  const values = props.device.attributes.activePattern.values ?? {};
  return Object.entries(values).map(([key, value]) => ({
    title: value,
    value: parseInt(key, 10)
  }));
});
</script>

<template>
  <v-select
    :model-value="props.device.attributes.activePattern.value"
    :items="activePatternItems"
    label="Mode"
    hide-details
    @update:modelValue="value => attrChangeHandler('activePattern', value)"
  ></v-select>
  <v-btn :color="(!props.device.attributes.patternStarted.value ? 'primary' : 'red')" class="mt-4" @click="() => attrChangeHandler('patternStarted', !props.device.attributes.patternStarted.value)"
  ><span v-if="!props.device.attributes.patternStarted.value">start</span><span v-else>stop</span></v-btn >

  <div v-if="props.device.attributes.patternStarted.value">
    <!-- Power Channels -->
    <div v-if="Object.keys(sliderAttributes.powerChannelAttributes).length > 0">
      <v-divider class="my-4" />
      <dl :key="attr.name" v-for="[key, attr] in typedEntries(sliderAttributes.powerChannelAttributes)">
        <dt>
          <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
        </dt>
        <dd>
          <DebouncedSlider
            :model-value="attr.value"
            @update:model-value="value => attrChangeHandler(key, value)"
            :attribute="attr"
            :disabled="!props.device.attributes.patternStarted.value || attr.min === attr.max"
            :slider-debounce="50"
            :input-debounce="100"
          />
        </dd>
      </dl>
    </div>

    <!-- Pattern Attributes -->
    <div v-if="Object.keys(sliderAttributes.patternAttributes).length > 0">
      <v-divider class="my-4" />
      <dl :key="attr.name" v-for="[key, attr] in typedEntries(sliderAttributes.patternAttributes)">
        <dt>
          <label>
            {{ attr.label ?? attr.name }}
            <span v-if="isIntRangeDeviceAttribute(attr) && attr.uom"> ({{ attr.uom }})</span>
          </label>
        </dt>
        <dd>
          <DebouncedSlider
            v-if="isIntRangeDeviceAttribute(attr)"
            :model-value="attr.value as number"
            @update:model-value="value => attrChangeHandler(key, value)"
            :attribute="attr"
            :disabled="!props.device.attributes.patternStarted.value"
            :slider-debounce="50"
            :input-debounce="100"
          />
          <v-select
              v-if="isListDeviceAttribute(attr)"
              :model-value="attr.value"
              :items="Object.entries(attr.values || {}).map(([key, value]) => ({ title: value, value: parseInt(key, 10) }))"
              color="primary"
              class="pa-0 ma-0"
              @update:modelValue="value => attrChangeHandler(key, value)"
              :disabled="attr.modifier === 'ro'"
          ></v-select>
        </dd>
      </dl>
    </div>
  </div>
</template>

<style scoped></style>
