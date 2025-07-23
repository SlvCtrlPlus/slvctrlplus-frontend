<script setup lang="ts">
import { ref } from 'vue'
import { useBackendStore } from '@/stores/backend.ts'
import { useAppStore } from "@/stores/app.ts";

const validForm = ref(false);

const backendStore = useBackendStore()
const appStore = useAppStore();
const backendInput = ref('')
const history = backendStore.history

const serverUrlRules = [
  (v: string) => !!v || "Server URL is required",
  (v: string) =>
      /^https?:\/\/.+/.test(v) || "Server URL must start with http(s)://",
  (v: string) => /[^/]$/.test(v) || "Server URL must not end in a /",
  (v: string) =>
      v.length >= 10 || "Server URL must be at least 10 characters long",
  (v: string) => /^https?:\/\/[^\/?#]+$/.test(v) || "Server URL must not have a path or query",
];

function connect() {
  if (validForm.value && backendInput.value.trim()) {
    backendStore.setBackendUrl(backendInput.value.trim());
    location.reload();
  }
}

function select(url: string) {
  backendStore.setBackendUrl(url);
  location.reload();
}
</script>

<template>
  <v-container
      fluid
      class="d-flex flex-column justify-center align-center fill-height"
  >
    <v-card class="mx-auto pa-4" style="width: 800px; max-width: 100%;">
      <v-card-title class="text-h2 text-center my-4">SlvCtrl+</v-card-title>
      <v-card-text>
        <v-form v-model="validForm" @submit.prevent="connect">
          <v-text-field
            v-model="backendInput"
            label="Enter server URL"
            type="url"
            :rules="serverUrlRules"
            validate-on="input"
            class="mb-2"
          />
          <v-btn type="submit" color="primary" block :disabled="!validForm">
            Connect
          </v-btn>
        </v-form>

        <div v-if="history.length">
          <v-divider class="my-8" />
          <p class="text-h6 ma-0 pa-0">Recent</p>
          <v-list dense>
            <v-list-item
                v-for="url in history"
                :key="url"
                class="cursor-pointer"
                @click="select(url)"
            >
              <v-list-item-title>{{ url }}</v-list-item-title>
              <template v-slot:append>
                <v-btn icon variant="plain" size="medium" density="compact" class="ml-auto" @click.stop="backendStore.removeBackendUrlFromHistory(url)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>

    <!-- Version info -->
    <div class="text-caption text-grey-darken-3 mt-4">
      Version: {{ appStore.getVersion() }}
    </div>
  </v-container>
</template>

<style scoped>
.text-h2 {
  font-family: Impact, sans-serif;
}
</style>