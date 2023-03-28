<script setup lang="ts">
import { reactive } from "vue";
import { useSocketIO } from "../../../plugins/vueSocketIOClient.js";
import type { Socket } from "socket.io-client";
import type DeviceGeneric from "../../../model/DeviceGeneric";
import DeviceCommunicator from "../../../helper/DeviceCommunicator";

interface Props {
  device: DeviceGeneric;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const device = reactive<DeviceGeneric>(props.device);

const deviceComm = new DeviceCommunicator(props.device, io);

const attributeChangeHandler = (
  attrName: string,
  newValue: string | boolean | number
): void => deviceComm.setAttribute(attrName, newValue);
</script>

<template>
  <div :key="attr.name" v-for="attr in props.device.attributes">
    <dl>
      <dt>
        <label>{{ attr.name }}</label>
      </dt>
      <dd>
        <v-checkbox
          v-if="attr.type === 'bool'"
          v-model="device.data[attr.name]"
          :label="attr.name"
          color="primary"
          hide-details="hide-details"
          class="pa-0 ma-0"
          @update:modelValue="
            attributeChangeHandler(attr.name, device.data[attr.name])
          "
          :disabled="attr.modifier === 'ro'"
        ></v-checkbox>

        <v-select
            v-if="attr.type === 'list'"
            v-model="device.data[attr.name]"
            :items="attr.values"
            color="primary"
            class="pa-0 ma-0"
            @update:modelValue="
            attributeChangeHandler(attr.name, device.data[attr.name])
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
            attributeChangeHandler(attr.name, device.data[attr.name])
          "
          :disabled="attr.modifier === 'ro'"
        ></v-text-field>
        <v-slider
          v-if="attr.type === 'range'"
          v-model="device.data[attr.name]"
          @update:modelValue="
            attributeChangeHandler(attr.name, device.data[attr.name])
          "
          :min="attr.min"
          :max="attr.max"
          step="1"
          color="primary"
          hide-details
          :disabled="attr.modifier === 'ro'"
        >
          <template v-slot:append>
            <v-text-field
              v-model="device.data[attr.name]"
              @update:modelValue="
                attributeChangeHandler(attr.name, device.data[attr.name])
              "
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
