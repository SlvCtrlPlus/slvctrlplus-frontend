<script setup lang="ts">
import {useAppStore} from "@/stores/app.ts";
import {storeToRefs} from "pinia";
import {computed, ref, watch} from "vue";
import {format} from "date-fns";

const appStore = useAppStore();
const { isServerOnline, wasSeverEverOnline } = storeToRefs(appStore);

let debounceTimer: number | undefined = undefined;
let disconnectSecondsTimer: number | undefined = undefined
const shouldShowOverlay = ref(false);
const disconnectSeconds = ref(0)

watch(isServerOnline, (online) => {
  if (!online) {
    disconnectSeconds.value = 0
    disconnectSecondsTimer = window.setInterval(() => disconnectSeconds.value += 1, 1000)

    // Wait 1s before showing overlay
    debounceTimer = window.setTimeout(() => {
      shouldShowOverlay.value = true;
    }, 1000)
  } else {
    // Clear timer and hide overlay immediately
    clearTimeout(debounceTimer);
    clearInterval(disconnectSecondsTimer)

    shouldShowOverlay.value = false;
    disconnectSeconds.value = 0;
  }
}, { immediate: true })

const durationHuman = computed(() => {
  const durationDate = new Date(disconnectSeconds.value * 1000)
  return format(durationDate, 'm:ss')
});
</script>

<template>
  <v-overlay
      persistent
      :model-value="shouldShowOverlay"
      :scrim="'transparent'"
      transition="false"
      class="sever-status-overlay align-center justify-center text-white text-h6 font-weight-bold text-center"
  >
    <div>
      <p class="mb-4"><v-icon icon="mdi-cloud-off" /></p>
      <p><span v-if="!wasSeverEverOnline">
        Cannot connect to server. Please check your network.
      </span>
        <span v-else>
        Connection lost. Trying to reconnect... ({{ durationHuman }})
      </span></p>
    </div>
  </v-overlay>
</template>

<style scoped>
.sever-status-overlay {
  backdrop-filter: blur(6px);
  background-color: rgba(255, 38, 38, 0.2);
}
</style>
