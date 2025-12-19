<script setup lang="ts">
import { ref, watch } from "vue";
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import type DeviceGeneric from "../../../model/DeviceGeneric";
import type Device from "../../../model/Device";
import DeviceCommunicator from "../../../helper/DeviceCommunicator";

interface Props {
  device: DeviceGeneric;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const device = props.device;

const deviceComm = new DeviceCommunicator(props.device as Device, io);

// Store debounce timers for each attribute
const debounceTimers = ref<Record<string, number>>({});

// Track which controls are actively being interacted with
const activeControls = ref<Set<string>>(new Set());

// Local state for slider values to prevent reactive bouncing
const localValues = ref<Record<string, number>>({});

// Watch device.attributes to handle dynamically added/removed attributes
watch(() => device.attributes, (attrs) => {
  if (!attrs) return;

  attrs.forEach(attr => {
    if (attr.type === 'range') {
      // Initialize new attributes that don't exist yet
      if (localValues.value[attr.name] === undefined && device.data[attr.name] !== undefined) {
        localValues.value[attr.name] = device.data[attr.name] as number;
      }
    }
  });

  // Remove old attributes that no longer exist
  const currentAttrNames = new Set(attrs.map(a => a.name));
  Object.keys(localValues.value).forEach(key => {
    if (!currentAttrNames.has(key)) {
      delete localValues.value[key];
    }
  });
}, { immediate: true, deep: true });

// Watch device.data changes and update local values only when not actively interacting
watch(() => device.data, (newData) => {
  if (!newData) return;

  device.attributes.forEach(attr => {
    if (attr.type === 'range' && !activeControls.value.has(attr.name)) {
      const value = (newData as Record<string, unknown>)[attr.name];
      if (typeof value === 'number') {
        localValues.value[attr.name] = value;
      }
    }
  });
}, { deep: true });

const attributeChangeHandler = (
  attrName: string,
  newValue: string | boolean | number,
  debounceMs = 0
): void => {
  // Clear existing timer for this attribute if it exists
  if (debounceTimers.value[attrName]) {
    clearTimeout(debounceTimers.value[attrName]);
  }

  if (debounceMs === 0) {
    // No debounce, execute immediately
    deviceComm.setAttribute(attrName, newValue);
  } else {
    // Set up debounced execution
    debounceTimers.value[attrName] = window.setTimeout(() => {
      deviceComm.setAttribute(attrName, newValue);
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
</script>

<template>
  <div :key="attr.name" v-for="attr in device.attributes">
    <dl>
      <dt>
        <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
      </dt>
      <dd>
        <v-switch
          v-if="attr.type === 'bool'"
          v-model="device.data[attr.name]"
          color="primary"
          :hide-details="true"
          class="pa-0 ma-0"
          @update:modelValue="
            attributeChangeHandler(attr.name, device.data[attr.name] as boolean)
          "
          :disabled="attr.modifier === 'ro'"
        ></v-switch>
        <v-select
          v-if="attr.type === 'list'"
          v-model="device.data[attr.name]"
          :items="Object.entries(attr.values || {}).map(([key, value]) => ({ title: value, value: parseInt(key) }))"
          color="primary"
          class="pa-0 ma-0"
          @update:modelValue="
            attributeChangeHandler(attr.name, device.data[attr.name] as number)
          "
          :disabled="attr.modifier === 'ro'"
        ></v-select>
        <v-text-field
          v-if="
            attr.type === 'str' || attr.type === 'float' || attr.type === 'int'
          "
          v-model="device.data[attr.name]"
          color="primary"
          class="pa-0 ma-0"
          :type="attr.type === 'str' ? 'text' : 'number'"
          @update:modelValue="
            attributeChangeHandler(attr.name, device.data[attr.name] as string | number)
          "
          :disabled="attr.modifier === 'ro'"
        ></v-text-field>
        <v-slider
          v-if="attr.type === 'range'"
          v-model="localValues[attr.name]"
          @update:modelValue="
            (value) => {
              localValues[attr.name] = value;
              attributeChangeHandler(attr.name, value, 200);
            }
          "
          @start="() => handleSliderStart(attr.name)"
          @end="() => handleSliderEnd(attr.name)"
          :min="attr.min"
          :max="attr.max"
          :step="attr.incrementStep ?? 1"
          color="primary"
          hide-details
          :disabled="attr.modifier === 'ro'"
        >
          <template v-slot:append>
            <v-text-field
              v-model="localValues[attr.name]"
              @update:modelValue="
                (value) => {
                  const numValue = parseFloat(value);
                  localValues[attr.name] = numValue;
                  attributeChangeHandler(attr.name, numValue, 200);
                }
              "
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
              :disabled="attr.modifier === 'ro'"
            ></v-text-field>
          </template>
        </v-slider>
      </dd>
    </dl>
  </div>
</template>
