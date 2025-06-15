<script setup lang="ts">
import DeviceIcon from "../icons/DeviceIcon.vue";
import DeviceControl from "./DeviceControl.vue";
import type Device from "../../model/Device";
import { onBeforeUnmount, reactive, ref } from "vue";

interface Props {
  device: Device;
  renderPopupLink: boolean;
}

const props = defineProps<Props>();
const device = reactive<Device>(props.device);

let popup: Window | null = null;
const isPopupOpen = ref(false);

const onPopupClose = () => {
  isPopupOpen.value = false;
  popup = null;
  console.log(`popup state reset because popup unloaded/was closed`);
};

const openInNewWindow = (device: Device): void => {
  if (isPopupOpen.value === true && popup !== null) {
    console.log(`popup is already open. Bring it into focus`);
    popup.focus();
    return;
  }

  console.log("open popup for device: " + device.deviceId);
  popup = window.open(
    `${location.protocol}//${location.host}/mission-control/device/${device.deviceId}`,
    "",
    "width=600,height=400"
  );

  if (!popup) {
    return;
  }

  popup.addEventListener("load", () => {
    if (!popup) {
      return;
    }
    popup.document.title = `${document.title}: ${device.deviceName}`;
    popup.addEventListener("beforeunload", () => onPopupClose());
  });

  isPopupOpen.value = true;
};

onBeforeUnmount(() => {
  if (popup && !popup.closed) {
    popup.close();
  }
});
</script>

<template>
  <v-card class="rounded-sm">
    <v-card-title class="d-flex justify-space-between pr-2">
      <div>
        <DeviceIcon :device="device" class="icon" />
        {{ device.deviceName }}
      </div>

      <v-btn
        v-if="renderPopupLink"
        size="x-small"
        icon="mdi-open-in-new"
        variant="plain"
        title="Open this device in a separate window"
        @click="openInNewWindow(device)"
      />
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="fill-height-grid">
      <DeviceControl :device="device" />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.icon {
  width: 1em;
  margin: 0 0.25em 0 0;
}
</style>
