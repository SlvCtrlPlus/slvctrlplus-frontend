<script setup lang="ts">
import { reactive, ref, watch, computed } from "vue";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import DeviceCommunicator from "../../../helper/DeviceCommunicator";
import type {DeviceZc95} from "@/model/DeviceZc95";
import {getDeviceAttribute} from "@/model/DeviceGeneric";
import type DeviceZc95Data from "@/model/DeviceZc95Data";

interface Props {
  device: DeviceZc95;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const device = reactive<DeviceZc95>(props.device);

const deviceComm = new DeviceCommunicator(props.device, io);

// Store debounce timers for each attribute
const debounceTimers = ref<Record<string, number>>({});

// Track which controls are actively being interacted with
const activeControls = ref<Set<string>>(new Set());

// Local state for all slider values to prevent reactive bouncing
const localValues = ref<Record<string, number>>({});

// Initialize all slider attributes (powerChannels + patternAttributes)
const initializeSliderAttributes = () => {
  if (!device.data) return;

  Object.keys(device.data).forEach(key => {
    if ((key.startsWith('powerChannel') || key.startsWith('patternAttribute')) &&
        typeof device.data[key as keyof DeviceZc95Data] === 'number') {
      if (localValues.value[key] === undefined) {
        localValues.value[key] = (device.data[key as keyof DeviceZc95Data] as number) || 0;
      }
    }
  });
};

// Initialize on mount
initializeSliderAttributes();

// Watch device.data changes and update local values only when not actively interacting
watch(() => device.data, (newData) => {
  if (!newData) return;

  // Update all slider attributes dynamically
  Object.keys(newData).forEach(key => {
    if (key.startsWith('powerChannel') || key.startsWith('patternAttribute')) {
      if (!activeControls.value.has(key)) {
        const value = newData[key as keyof DeviceZc95Data];
        localValues.value[key] = value as number;
      }
    }
  });

  // Initialize new slider attributes if they appear
  initializeSliderAttributes();
}, { deep: true });

const attrChangeHandler = (
  attrName: keyof DeviceZc95Data,
  value: string | number | boolean,
  debounceMs = 0
): void => {
  // Clear existing timer for this attribute if it exists
  if (debounceTimers.value[attrName]) {
    clearTimeout(debounceTimers.value[attrName]);
  }

  if (debounceMs === 0) {
    // No debounce, execute immediately
    deviceComm.setAttribute(attrName, value);
  } else {
    // Set up debounced execution
    debounceTimers.value[attrName] = window.setTimeout(() => {
      deviceComm.setAttribute(attrName, value);
      delete debounceTimers.value[attrName];
    }, debounceMs);
  }
};

const handleSliderStart = (attrName: string): void => {
  activeControls.value.add(attrName);
};

const handleSliderEnd = (attrName: string): void => {
  // Remove from active controls after a short delay to ensure final value is sent
  setTimeout(() => {
    activeControls.value.delete(attrName);
  }, 100);
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
      <div :key="attr.name" v-for="attr in sliderAttributes.powerChannels">
        <dl>
          <dt>
            <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
          </dt>
          <dd>
            <v-slider
              v-model="localValues[attr.name]"
              @update:modelValue="value => attrChangeHandler(attr.name as keyof DeviceZc95Data, value, 200)"
              @start="() => handleSliderStart(attr.name)"
              @end="() => handleSliderEnd(attr.name)"
              :min="attr.min"
              :max="attr.max"
              :step="attr.incrementStep ?? 1"
              color="primary"
              hide-details
              :disabled="!device.data.patternStarted"
            >
              <template v-slot:append>
                <v-text-field
                  v-model="localValues[attr.name]"
                  @update:modelValue="value => attrChangeHandler(attr.name as keyof DeviceZc95Data, value, 200)"
                  @focus="() => handleSliderStart(attr.name)"
                  @blur="() => handleSliderEnd(attr.name)"
                  hide-details
                  single-line
                  :min="attr.min"
                  :max="attr.max"
                  density="compact"
                  variant="outlined"
                  type="number"
                  style="width: 80px"
                  :disabled="!device.data.patternStarted"
                ></v-text-field>
              </template>
            </v-slider>
          </dd>
        </dl>
      </div>
    </div>

    <!-- Pattern Attributes -->
    <div v-if="sliderAttributes.patternAttributes.length > 0">
      <v-divider class="my-4" />
      <div :key="attr.name" v-for="attr in sliderAttributes.patternAttributes">
        <dl>
          <dt>
            <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
          </dt>
          <dd>
            <v-slider
              v-model="localValues[attr.name]"
              @update:modelValue="value => attrChangeHandler(attr.name as keyof DeviceZc95Data, value, 200)"
              @start="() => handleSliderStart(attr.name)"
              @end="() => handleSliderEnd(attr.name)"
              :min="attr.min"
              :max="attr.max"
              :step="attr.incrementStep ?? 1"
              color="primary"
              hide-details
              :disabled="!device.data.patternStarted"
            >
              <template v-slot:append>
                <v-text-field
                  v-model="localValues[attr.name]"
                  @update:modelValue="value => attrChangeHandler(attr.name as keyof DeviceZc95Data, value, 200)"
                  @focus="() => handleSliderStart(attr.name)"
                  @blur="() => handleSliderEnd(attr.name)"
                  hide-details
                  single-line
                  :min="attr.min"
                  :max="attr.max"
                  density="compact"
                  variant="outlined"
                  type="number"
                  style="width: 80px"
                  :disabled="!device.data.patternStarted"
                ></v-text-field>
              </template>
            </v-slider>
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
