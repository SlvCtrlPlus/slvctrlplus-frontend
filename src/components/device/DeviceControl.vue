<template>
  <component :is="comp" :device="device"></component>
</template>

<script setup lang="ts">
import {computed, defineAsyncComponent} from "vue";
import type Device from "../../model/Device";

interface Props {
  device: Device
}

const props = defineProps<Props>()

const comp = computed<string>(() => {
  let controlComponent: string|null = null;

  switch (props.device.deviceModel) {
    case 'air_valve': controlComponent = 'DeviceAirValveControl'; break;
    case 'et312': controlComponent = 'DeviceEt312Control'; break;
    case 'strikerMk2': controlComponent = 'DeviceStrikerMk2Control'; break;
    case 'distance': controlComponent = 'DeviceDistanceControl'; break;
    default: return controlComponent;
  }

  return defineAsyncComponent(() => import(`./control/${controlComponent}.vue`))
})
</script>
