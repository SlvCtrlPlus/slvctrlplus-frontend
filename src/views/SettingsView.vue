<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings.js";
import { storeToRefs } from "pinia";

const valid = ref(false);

const settingsStore = useSettingsStore();
const { serverUrl, theme } = storeToRefs(settingsStore);

const serverUrlRules = [
  (v: string) => !!v || "Server URL is required",
  (v: string) =>
    v.length >= 10 || "Server URL must be at least 10 characters long",
  (v: string) =>
    /^https?:\/\/.+/.test(v) || "Server URL must start with http(s)://",
  (v: string) => /[^/]$/.test(v) || "Server URL must not end in a /",
];
</script>

<template>
  <v-container fluid class="px-sm-6">
    <h2 class="text-h4 text-grey-darken-1 py-4">Settings</h2>
    <v-form v-model="valid">
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="serverUrl"
            :rules="serverUrlRules"
            label="Server URL"
            required
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <v-switch
            color="primary"
            v-model="theme"
            false-value="light"
            true-value="dark"
            :label="`Dark mode: ${'dark' === theme ? 'on' : 'off'}`"
          ></v-switch>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<style scoped></style>
