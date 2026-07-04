<template>
  <!--component :is="comp"></component-->
  <v-icon>{{ comp }}</v-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type Device from '../../model/devices/Device';

interface Props {
  device: Device;
}

const props = defineProps<Props>();

const comp = computed<string>(() => {
  let iconComponentName: string;

  const deviceTypeModel = `${props.device.type}${
    props.device.type === 'slvCtrlPlus' ? `-${props.device.deviceModel}` : ''
  }`;

  switch (deviceTypeModel) {
    case 'slvCtrlPlus-air_valve':
      iconComponentName = 'mdi-fan';
      break;
    case 'slvCtrlPlus-et312':
      iconComponentName = 'mdi-lightning-bolt';
      break;
    case 'slvCtrlPlus-strikerMk2':
      iconComponentName = 'mdi-swap-horizontal';
      break;
    case 'slvCtrlPlus-distance':
      iconComponentName = 'mdi-ruler';
      break;
    case 'airotic':
      iconComponentName = 'mdi-chart-bubble';
      break;
    case 'zc95':
    case 'estim2b':
      iconComponentName = 'mdi-lightning-bolt-circle';
      break;
    case 'virtual':
      iconComponentName = 'mdi-virtual-reality';
      break;
    default:
      iconComponentName = 'mdi-robot';
      break;
  }

  return iconComponentName;
});
</script>
