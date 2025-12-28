<script setup lang="ts">
import { computed, reactive } from "vue";
import {VirtualDeviceRandomGenerator} from "@/model/devices/virtual/VirtualRandomGenerator";

interface Props {
  device: VirtualDeviceRandomGenerator;
}

const props = defineProps<Props>();

const displayHtml = computed(() => {
  if (undefined === props.device.attributes.value.value) {
    return "";
  }
  return props.device.attributes.value.value;
});
</script>

<template>
  <div class="text-h3 text-center">
    {{ displayHtml }}
  </div>
</template>

<style scoped></style>
