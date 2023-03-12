<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import moment from "moment";

interface Props {
  logData: string[];
  runningSince: Date;
}

const props = defineProps<Props>();

const logData = computed(() => `${props.logData.join("\n")}\n\n`);
const runningSinceFormatted = computed(() => {
  const momentDate = moment(props.runningSince);
  return `${momentDate.format("YYYY-MM-DD, hh:mm:ss")} (${momentDate.fromNow()})`;
});

const logDataContainer = ref<HTMLElement | null>(null);

watch(logData, async () => {
  if (null === logDataContainer.value) return;
  await nextTick();
  logDataContainer.value.scrollTop = logDataContainer.value?.scrollHeight;
});
</script>

<template>
  <v-card>
    <v-card-title class="text-h5">Logs</v-card-title>
    <v-card-text>
      <p>Running since: {{ runningSinceFormatted }}</p>
      <pre id="log-data" ref="logDataContainer" class="bg-grey-darken-3 pa-3">{{
        logData
      }}</pre>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="text" @click="$emit('close')">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
#log-data {
  overflow: scroll;
  width: 100%;
  height: 500px;
  max-height: 100%;
  background: darkgray;
  white-space: pre;
  font-family: monospace;
}
</style>
