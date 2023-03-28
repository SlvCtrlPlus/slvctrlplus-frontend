<script setup lang="ts">
import { computed, reactive } from "vue";
import type DeviceDisplay from "../../../model/DeviceDisplay";

interface Props {
  device: DeviceDisplay;
}

interface DisplayElement {
  font: string | undefined;
  text: string;
  posX: string;
  posY: string;
}

const props = defineProps<Props>();

const device = reactive<DeviceDisplay>(props.device);

const displayHtml = computed(() => {
  if (null === device.data || null === device.data["content"]) {
    return "";
  }

  const contentBase64 = device.data["content"];
  const content = JSON.parse(atob(contentBase64)) as DisplayElement[];

  let html = "";

  for (const comp of content) {
    let style = "";
    let translateX = "0";
    let translateY = "0";

    if (comp.posX === "left") {
      style += ` left: 0; `;
    } else if (comp.posX === "center") {
      style += ` left: 50%; `;
      translateX = "-50%";
    } else if (comp.posX === "right") {
      style += ` right: 0; `;
    } else {
      const posXNum = Number(comp.posX);

      if (posXNum < 0) {
        style += ` right: ${posXNum * -1}px; `;
      } else {
        style += ` left: ${comp.posX}px; `;
      }
    }

    if (comp.posY === "top") {
      style += ` top: 0; `;
    } else if (comp.posY === "center") {
      style += ` top: 50%; `;
      translateY = "-50%";
    } else if (comp.posY === "bottom") {
      style += ` bottom: 0; `;
    } else {
      const posYNum = Number(comp.posY);

      if (posYNum < 0) {
        style += ` bottom: ${posYNum * -1}px; `;
      } else {
        style += ` top: ${comp.posY}px; `;
      }
    }

    style += ` transform: translate(${translateX}, ${translateY}); `;

    html += `<div class="element" style="${style}">${comp.text}</div>`;
  }

  return html;
});
</script>

<template>
  <div class="display text-h4 bg-grey-darken-3">
    <div class="content" v-html="displayHtml"></div>
  </div>
</template>

<style>
.display {
  padding: 0.5em;
}

.display .content {
  aspect-ratio: 2 / 1;
  position: relative;
}

.display .content .element {
  position: absolute;
  line-height: 1em;
}
</style>
