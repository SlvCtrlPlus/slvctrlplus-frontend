<script setup lang="ts">
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import type Device from "@/model/devices/Device";
import type { DeviceAttribute } from "@/model/devices/Device";
import DeviceCommunicator from "@/helper/DeviceCommunicator";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";
import {hasProperty, isIntRangeDeviceAttribute, isListDeviceAttribute, typedEntries} from "@/utils/utils";
import {computed} from "vue";

interface Props {
  device: Device;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device, io);

const definedAttributes = computed(() =>
    typedEntries(props.device.attributes).filter(([, attr]) => attr !== undefined) as [string, DeviceAttribute][]
);

const attributeChangeHandler = (attrName: string, newValue: string | boolean | number | null): void => {
  if (newValue === null) {
    return;
  }
  deviceComm.setAttribute(attrName, newValue);
};
</script>

<template>
  <div :key="key" v-for="[key, attr] in definedAttributes">
    <dl>
      <dt>
        <label>{{ attr.label ?? attr.name }}<span v-if="hasProperty(attr, 'uom') && 'string' === typeof attr.uom"> ({{ attr.uom }})</span></label>
      </dt>
      <dd>
        <v-switch
          v-if="attr.type === 'bool'"
          :model-value="attr.value"
          color="primary"
          :hide-details="true"
          class="pa-0 ma-0"
          @update:modelValue="value => attributeChangeHandler(attr.name, value)"
          :disabled="attr.modifier === 'ro'"
        ></v-switch>

        <v-select
          v-if="isListDeviceAttribute(attr)"
          :model-value="attr.value"
          :items="Object.entries(attr.values || {}).map(([laKey, value]) => ({ title: value, value: laKey }))"
          color="primary"
          class="pa-0 mt-2"
          @update:modelValue="value => attributeChangeHandler(attr.name, value)"
          :disabled="attr.modifier === 'ro'"
        ></v-select>

        <v-text-field
          v-if="
            attr.type === 'str' || attr.type === 'float' || attr.type === 'int'
          "
          :model-value="attr.value"
          color="primary"
          class="pa-0 ma-0"
          :type="attr.type === 'str' ? 'text' : 'number'"
          @update:modelValue="value => attributeChangeHandler(attr.name, value)"
          :disabled="attr.modifier === 'ro'"
        ></v-text-field>

        <DebouncedSlider
          v-if="isIntRangeDeviceAttribute(attr)"
          :model-value="attr.value"
          @update:model-value="value => attributeChangeHandler(attr.name, value)"
          :attribute="attr"
          :disabled="attr.modifier === 'ro'"
          :slider-debounce="50"
          :input-debounce="100"
        />
      </dd>
    </dl>
  </div>
</template>
