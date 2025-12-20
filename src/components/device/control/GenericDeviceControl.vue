<script setup lang="ts">
import { useSocketIO } from "@/plugins/vueSocketIOClient";
import type { Socket } from "socket.io-client";
import type DeviceGeneric from "@/model/DeviceGeneric";
import type Device from "@/model/Device";
import DeviceCommunicator from "@/helper/DeviceCommunicator";
import DebouncedSlider from "@/components/device/DebouncedSlider.vue";

interface Props {
  device: DeviceGeneric;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device as Device, io);

const attributeChangeHandler = (attrName: string, newValue: string | boolean | number | null): void => {
  if (newValue === null) {
    return;
  }
  deviceComm.setAttribute(attrName, newValue);
};
</script>

<template>
  <div :key="attr.name" v-for="attr in props.device.attributes">
    <dl>
      <dt>
        <label>{{ attr.label ?? attr.name }} <span v-if="attr.uom">({{ attr.uom }})</span></label>
      </dt>
      <dd>
        <v-switch
          v-if="attr.type === 'bool'"
          :model-value="props.device.data[attr.name]"
          color="primary"
          :hide-details="true"
          class="pa-0 ma-0"
          @update:modelValue="value => attributeChangeHandler(attr.name, value)"
          :disabled="attr.modifier === 'ro'"
        ></v-switch>

        <v-select
          v-if="attr.type === 'list'"
          :model-value="props.device.data[attr.name]"
          :items="Object.entries(attr.values || {}).map(([key, value]) => ({ title: value, value: parseInt(key, 10) }))"
          color="primary"
          class="pa-0 ma-0"
          @update:modelValue="value => attributeChangeHandler(attr.name, value)"
          :disabled="attr.modifier === 'ro'"
        ></v-select>

        <v-text-field
          v-if="
            attr.type === 'str' || attr.type === 'float' || attr.type === 'int'
          "
          :model-value="props.device.data[attr.name]"
          color="primary"
          class="pa-0 ma-0"
          :type="attr.type === 'str' ? 'text' : 'number'"
          @update:modelValue="value => attributeChangeHandler(attr.name, value)"
          :disabled="attr.modifier === 'ro'"
        ></v-text-field>

        <DebouncedSlider
          v-if="attr.type === 'range'"
          :model-value="props.device.data[attr.name] as number"
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
