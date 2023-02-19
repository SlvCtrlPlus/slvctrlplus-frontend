<template>
  <!--component :is="comp"></component-->
  <v-icon>{{ comp }}</v-icon>
</template>

<script setup lang="ts">
import {computed, defineAsyncComponent} from "vue";
import type Device from "../../model/Device.js";

interface Props {
  device: Device;
}

const props = defineProps<Props>()

const comp = computed<string>(() => {
  let iconComponentName: string;

  const deviceTypeModel = `${props.device.type}${props.device.type === 'generic' ? `-${props.device.deviceModel}` : ''}`;

  switch (deviceTypeModel) {
    case 'generic-air_valve': iconComponentName = 'mdi-fan'; break;
    case 'generic-et312': iconComponentName = 'mdi-lightning-bolt'; break;
    case 'generic-strikerMk2': iconComponentName = 'mdi-swap-horizontal'; break;
    case 'generic-distance': iconComponentName = 'mdi-ruler'; break;
    default: iconComponentName = 'mdi-robot'; break;
  }

  return iconComponentName;
  //return defineAsyncComponent(() => import(`./Icon${iconComponentName}.vue`))
});
</script>
