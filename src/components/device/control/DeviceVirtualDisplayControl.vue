<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import type DeviceDisplay from "../../../model/DeviceDisplay";

interface Props {
  device: DeviceDisplay;
}

const props = defineProps<Props>();
const device = reactive<DeviceDisplay>(props.device);

const displayHtml = computed(() => {
  if (null === device.data || null === device.data["content"]) {
    return "";
  }
  return device.data["content"];
});

let popup: Window | null = null;
const isPopupOpen = ref(false);

const popupDevice = reactive<DeviceDisplay>({ ...props.device });

const updatePopupDevice = (newDevice: DeviceDisplay) => {
  for (const key in newDevice) {
    if (newDevice.hasOwnProperty(key)) {
      popupDevice[key] = newDevice[key];
    }
  }
};

const openPopup = () => {
  if (popup && !popup.closed) {
    popup.focus();
    return;
  }

  popup = window.open("", "", "width=600,height=400");
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>Popup Window</title>
      </head>
      <body>
        <div id="popup-root" class="display text-h4 bg-grey-darken-3"></div>
        <script type="module">
            console.log('this is the inline script of the popup')
          import { createApp, reactive, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
          window.opener.initPopup(createApp, reactive, computed, window);
        <\/script>
      </body>
    </html>
  `);
  popup.document.close();

  isPopupOpen.value = true;

  // Listen for messages from the main window
  popup.addEventListener("message", (event) => {
    console.log(event.data);
    if (event.data.type === "updateDevice") {
      //console.log(`new device update RECEIVED by popup`)
      updatePopupDevice(JSON.parse(event.data.device));
    }
  });
  popup.addEventListener("beforeunload", () => {
    console.log("popup closed!");
    onPopupClose();
  });
};

const initPopup = (createApp, reactive, computed, popupWindow) => {
  console.log("init popup!")
  console.log(popupWindow.opener.popupDevice)
  const popupDevice = reactive(popupWindow.opener.popupDevice);

  const popupDisplayHtml = computed(() => {
    if (!popupDevice || !popupDevice.data || null === popupDevice.data || null === popupDevice.data["content"]) {
      return "";
    }
    return popupDevice.data["content"];
  });

  createApp({
    setup() {
      return { popupDisplayHtml };
    },
    template: '<div class="content" v-html="popupDisplayHtml"></div>',
  }).mount(popup.document.getElementById("popup-root"));

  //popupWindow.updatePopupDevice = updatePopupDevice;
  popupWindow.updatePopupDevice = popupWindow.opener.updatePopupDevice;
};

window.initPopup = initPopup;

const onPopupClose = () => {
  isPopupOpen.value = false;
  popup = null;
};

onMounted(() => {
  // Watch for changes in device data and send updates to the popup
  watch(
    device,
    (newDevice) => {
      if (popup && !popup.closed) {
        //console.log('new device update we SEND to the pop up')
        popup.postMessage(
          { type: "updateDevice", device: JSON.stringify(newDevice) },
          "*"
        );
      }
    },
    { deep: true }
  );
});

onBeforeUnmount(() => {
  if (popup && !popup.closed) {
    popup.close();
  }
});
</script>

<template>
  <div>
    <button @click="openPopup">Open Popup</button>
    <div v-if="!isPopupOpen" class="display text-h4 bg-grey-darken-3">
      <div class="content" v-html="displayHtml"></div>
    </div>
  </div>
</template>

<style>
.display {
  padding: 0;
}
</style>
