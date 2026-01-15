<template>
  <component :is="comp" :device="device"></component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { Component } from "vue";
import type Device from "@/model/devices/Device";

interface Props {
  device: Device;
}

const props = defineProps<Props>();

const componentMap = import.meta.glob('./control/**/*.vue');

const comp = computed<Component>(() => {
  let controlComponent: string;

  if (props.device.type === "slvCtrlPlus") {
    switch (props.device.deviceModel) {
      case "air_valve":
        controlComponent = "slvctrlplus/DeviceAirValveControl";
        break;
      case "et312":
        controlComponent = "slvctrlplus/DeviceEt312Control";
        break;
      case "strikerMk2":
        controlComponent = "slvctrlplus/DeviceStrikerMk2Control";
        break;
      case "distance":
        controlComponent = "slvctrlplus/DeviceDistanceControl";
        break;
      case "display":
        controlComponent = "slvctrlplus/DeviceDisplayControl";
        break;
      default:
        controlComponent = "GenericDeviceControl";
    }
  } else if (props.device.type === "buttplugIo") {
    controlComponent = "GenericDeviceControl";
  } else if (props.device.type === "zc95") {
    controlComponent = "DeviceZc95Control";
  } else if (props.device.type === "virtual") {
    controlComponent = "";
    switch (props.device.deviceModel) {
      case "display":
        controlComponent = "virtual/DeviceVirtualDisplayControl";
        break;
      case "randomGenerator":
        controlComponent = "virtual/DeviceVirtualRandomGeneratorControl";
        break;
      case "tts":
        controlComponent = "virtual/DeviceVirtualTtsControl";
        break;
      case "piper":
        controlComponent = "virtual/DeviceVirtualPiperTtsControl";
        break;
      default:
        controlComponent = "GenericDeviceControl";
    }
  } else {
    console.log(
      `Cannot find control component for device of type ${props.device.type}, fall back to generic device control`
    );
    controlComponent = "GenericDeviceControl";
  }

  const importPath = `./control/${controlComponent}.vue`;
  if (!(importPath in componentMap)) {
    throw new Error(`Component not found: ${importPath}`);
  }
  return defineAsyncComponent(componentMap[importPath] as () => Promise<Component>);
});
</script>
