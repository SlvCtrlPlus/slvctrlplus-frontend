<template>
  <component :is="comp" :device="device"></component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type Device from "../../model/Device";

interface Props {
  device: Device;
}

const props = defineProps<Props>();

const comp = computed<string>(() => {
  let controlComponent: string | null = null;

  if (props.device.type === "slvCtrlPlus") {
    switch (props.device.deviceModel) {
      case "air_valve":
        controlComponent = "DeviceAirValveControl";
        break;
      case "et312":
        controlComponent = "DeviceEt312Control";
        break;
      case "strikerMk2":
        controlComponent = "DeviceStrikerMk2Control";
        break;
      case "distance":
        controlComponent = "DeviceDistanceControl";
        break;
      case "display":
        controlComponent = "DeviceDisplayControl";
        break;
      default:
        controlComponent = "GenericDeviceControl";
    }
  } else if (props.device.type === "buttplugIo") {
    controlComponent = "GenericDeviceControl";
  } else if (props.device.type === "virtualDisplay") {
    controlComponent = "DeviceVirtualDisplayControl";
  } else {
    console.log(
      `Cannot find control component for device of type ${props.device.type}, fall back to generic device control`
    );
    controlComponent = "GenericDeviceControl";
  }

  return defineAsyncComponent(
    () => import(`./control/${controlComponent}.vue`)
  );
});
</script>
