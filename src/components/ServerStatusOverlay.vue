<template>
  <v-overlay persistent :model-value="!isServerOnline" :scrim="'transparent'"
      class="sever-status-overlay align-center justify-center text-white text-h6 font-weight-bold text-center"
  >
    <div>
      <p class="mb-4"><v-icon icon="mdi-cloud-off" /></p>
      <p><span v-if="!wasSeverEverOnline">
        Cannot connect to server. Please check your network.
      </span>
      <span v-else>
        Connection lost. Trying to reconnect...
      </span></p>
    </div>
  </v-overlay>
</template>

<script setup lang="ts">
import {useAppStore} from "@/stores/app.ts";
import {watch} from "vue";
import {storeToRefs} from "pinia";

const appStore = useAppStore();
const { isServerOnline, wasSeverEverOnline } = storeToRefs(appStore);

document.body.style.overflow = 'hidden';
watch(isServerOnline, (online) => {
  document.body.style.overflow = online ? '' : 'hidden';
})
</script>

<style scoped>
.sever-status-overlay {
  backdrop-filter: blur(6px);
  background-color: rgba(255, 38, 38, 0.2);
}
</style>
