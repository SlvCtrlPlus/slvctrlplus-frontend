<script setup lang="ts">
import { ref } from 'vue'
import { useBackendStore } from '@/stores/backend.ts'
import { useAppStore } from "@/stores/app.ts";

const backendStore = useBackendStore()
const appStore = useAppStore();
const backendInput = ref('')
const history = backendStore.history

const serverUrlRules = [
  (v: string) => !!v || "Server URL is required",
  (v: string) =>
      v.length >= 10 || "Server URL must be at least 10 characters long",
  (v: string) =>
      /^https?:\/\/.+/.test(v) || "Server URL must start with http(s)://",
  (v: string) => /[^/]$/.test(v) || "Server URL must not end in a /",
];

function connect() {
  if (backendInput.value.trim()) {
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
        <v-form v-model="validUserInterfaceFrom" @submit.prevent="saveServerSettings">
          <v-text-field
            v-model="backendInput"
            label="Enter backend URL"
            :rules="serverUrlRules"
            class="mb-2"
          />
          <v-btn color="primary" block @click="connect">
            Connect
          </v-btn>
      </v-form>

        <v-divider class="my-8" />

        <div v-if="history.length">
          <p class="text-h6 mb-2">Recent</p>
          <v-list dense>
            <v-list-item
                v-for="url in history"
                :key="url"
                @click="select(url)"
                class="cursor-pointer"
            >
              <v-list-item-title>{{ url }}</v-list-item-title>
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