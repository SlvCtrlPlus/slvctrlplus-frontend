<script setup lang="ts">
import { computed } from "vue";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "@/helper/DeviceCommunicator";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";
import type {DeviceData} from "@/model/devices/Device";
import {isIntRangeDeviceAttribute, typedEntries} from "@/utils/utils";
import {
  DeviceEstim2b,
  PatternDeviceEStim2bAttributes,
  PowerLevelDeviceEStim2bAttributes
} from "@/model/devices/estim2b/DeviceEstim2b";

interface Props {
  device: DeviceEstim2b;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device, io);

const attrChangeHandler = (
  attrName: keyof DeviceData<DeviceEstim2b>,
  value: string | number | boolean | null
): void => {
  if (null === value) {
    return;
  }
  deviceComm.setAttribute(attrName, value);
};

// Get all slider attributes (powerChannels + patternAttributes) sorted
const sliderAttributes = computed(() => {
  const powerChannelAttributes = Object.fromEntries(
      Object.entries(props.device.attributes).filter(([key]) => key.match(/^channel[AB]Level$/))
  ) as PowerLevelDeviceEStim2bAttributes;

  const patternAttributes = Object.fromEntries(
      Object.entries(props.device.attributes).filter(([key, value]) => ['pulseFrequency', 'pulsePwm'].indexOf(key) !== -1 && undefined !== value)
  ) as Required<PatternDeviceEStim2bAttributes>;

  return { powerChannelAttributes, patternAttributes };
});

const modeItems = computed(() => {
  const values = props.device.attributes.mode.values ?? {};
  return Object.entries(values).map(([key, value]) => ({
    title: value,
    value: parseInt(key, 10)
  }));
});

const batteryIcon = computed(() => {
  switch (props.device.attributes.batteryStatus.value) {
    case 'mains':
      return { icon: 'mdi-power-plug', color: undefined };
    case 'full':
      return { icon: 'mdi-battery-90', color: undefined };
    case 'medium':
      return { icon: 'mdi-battery-50', color: undefined };
    case 'low':
      return { icon: 'mdi-battery-30', color: 'warning' };
    case 'critical':
      return { icon: 'mdi-battery-alert-variant-outline', color: 'error' };
    default:
      return { icon: 'mdi-battery', color: '' };
  }
});
</script>

<template>
  <v-select
    :model-value="props.device.attributes.mode.value"
    :items="modeItems"
    label="Mode"
    hide-details
    @update:modelValue="value => attrChangeHandler('mode', value)"
  ></v-select>

  <!-- Pattern attributes -->
  <div class="my-4">
    <dl class="my-2" :key="attr.name" v-for="[key, attr] in typedEntries(sliderAttributes.patternAttributes)">
      <dt>
        <label>
          {{ attr.label ?? attr.name }}
          <span v-if="isIntRangeDeviceAttribute(attr) && attr.uom"> ({{ attr.uom }})</span>
        </label>
      </dt>
      <dd>
        <DebouncedSlider
            v-if="isIntRangeDeviceAttribute(attr)"
            :model-value="attr.value"
            @update:model-value="value => attrChangeHandler(key, value)"
            :attribute="attr"
            :slider-debounce="50"
            :input-debounce="100"
        />
      </dd>
    </dl>
  </div>

  <!-- Power Channels -->
  <div v-if="Object.keys(sliderAttributes.powerChannelAttributes).length > 0">
    <v-divider class="my-4" />
    <dl class="my-2" :key="attr.name" v-for="[key, attr] in typedEntries(sliderAttributes.powerChannelAttributes)">
      <dt>
        <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
      </dt>
      <dd>
        <DebouncedSlider
          :model-value="attr.value"
          @update:model-value="value => attrChangeHandler(key, value)"
          :attribute="attr"
          :slider-debounce="50"
          :input-debounce="100"
        />
      </dd>
    </dl>
  </div>

  <!-- Other -->
  <dl class="my-2">
    <dt>
      <label>High power mode</label>
    </dt>
    <dd>
      <v-switch
          :model-value="props.device.attributes.highPowerMode.value"
          color="primary"
          :hide-details="true"
          class="pa-0 ma-0"
          @update:modelValue="value => attrChangeHandler('highPowerMode', value)"
      ></v-switch>
    </dd>
  </dl>

  <v-divider />
  <v-footer class="px-0 mt-4 mx-1">
    <v-row align="center" no-gutters>
      <v-col cols="auto">
        <span v-if="props.device.attributes.channelsJoined.value"><v-icon icon="mdi-link-variant" class="mb-1"/> Channels joined</span>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-tooltip location="left">
          <template #activator="{ props }">
            <v-icon v-bind="props" :icon="batteryIcon.icon" :color="batteryIcon.color" />
          </template>
          Battery status: {{ props.device.attributes.batteryStatus.value }}
        </v-tooltip>
      </v-col>
    </v-row>
  </v-footer>
</template>

<style scoped></style>
