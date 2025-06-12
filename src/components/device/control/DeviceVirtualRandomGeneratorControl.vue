<script setup lang="ts">
import { computed, reactive } from "vue";
import type VirtualRandomGenerator from "../../../model/virtual/VirtualRandomGenerator";

interface Props {
  device: VirtualRandomGenerator;
}

const props = defineProps<Props>();
const device = reactive<VirtualRandomGenerator>(props.device);

const displayHtml = computed(() => {
  if (null === device.data || null === device.data["value"]) {
    return "";
  }
  return device.data["value"];
});
</script>

<template>
  <div class="text-h3 text-center">
    {{ displayHtml }}
  </div>
</template>

<style scoped></style>
