<script setup lang="ts">
import {defineAsyncComponent, nextTick, ref, watch} from "vue";
import { useSettingsStore } from "../stores/settings.js";
import { useAppStore } from "../stores/app.js";
import { storeToRefs } from "pinia";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {useBackendStore} from "@/stores/backend.ts";

// Load Monaco Editor asynchronously for performance reasons
const MonacoEditor = defineAsyncComponent(() => import('monaco-editor-vue3'));

const tab = ref("tab-ui");

const validUserInterfaceFrom = ref(false);

const settingsStore = useSettingsStore();
const appStore = useAppStore();
const backendStore = useBackendStore();
const { theme, serverSettings, validationErrors } = storeToRefs(settingsStore);

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
const options: monaco.editor.IEditorOptions = {
  fontSize: 16,
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
};

watch(tab, async (newVal) => {
  if (newVal === 'tab-server') {
    await nextTick();
    editorInstance?.layout();
  }
});

function editorWillMount(monacoInstance: typeof monaco): void {
  monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
  });
}

function storeEditorInstance(
  editor: monaco.editor.IStandaloneCodeEditor
): void {
  const container = document.getElementById("monaco-wrapper");

  if (container) {
    const rect = container.getBoundingClientRect();
    editor.layout({ width: rect.width, height: rect.height });
  }

  window.addEventListener("resize", () => {
    // make editor as small as possible
    editor.layout({ width: 0, height: 0 });

    // wait for next frame to ensure last layout finished
    window.requestAnimationFrame(() => {
      const monacoElement = document.getElementById("monaco-wrapper");

      if (null === editor || null === monacoElement) {
        return;
      }

      // get the parent dimensions and re-layout the editor
      const rect = monacoElement.getBoundingClientRect();
      editor.layout({ width: rect.width, height: rect.height });
    });
  });
  editorInstance = editor;
}

function saveServerSettings(): void {
  settingsStore.saveServerSettings()
      .then(() => appStore.displaySnackbar(`Server settings saved`))
      .catch((err: Error) => appStore.displaySnackbar(`Sever settings could not be saved: ${err.message}`, "red"));
}

function clearBackendUrl(): void {
  console.log(`Reset backend url`)
  backendStore.clearBackendUrl();
  location.reload();
}
</script>

<template>
  <v-container fluid class="px-sm-6 d-flex align-start flex-column fill-height">
    <h2 class="text-h4 text-grey-darken-1 py-4">Settings</h2>

    <v-container fluid class="px-0">
      <v-tabs v-model="tab" color="primary">
        <v-tab value="tab-ui">User Interface</v-tab>
        <v-tab value="tab-server">Server</v-tab>
      </v-tabs>

      <v-window v-model="tab" class="mt-4">
        <v-window-item value="tab-ui">
          <v-form v-model="validUserInterfaceFrom">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Server URL"
                  v-model="backendStore.backendUrl"
                  readonly
                ></v-text-field>
                <v-btn @click="clearBackendUrl">Change</v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
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
        </v-window-item>

        <v-window-item value="tab-server">
          <v-alert type="warning" variant="tonal">
            Be cautious! Messing with the server settings can lead to an unusable device.
          </v-alert>
          <v-alert type="error" variant="tonal" v-if="validationErrors !== null">
            <p>{{ validationErrors.message }}</p>
            <ul class="pl-4 list-disc">
              <li v-for="(error, index) in validationErrors.errors" :key="index">
                {{ error.instancePath }} {{ error.message }}
              </li>
            </ul>
          </v-alert>
          <v-form v-model="validUserInterfaceFrom" @submit.prevent="saveServerSettings">
            <v-row>
              <v-col cols="12">
                <v-container class="ma-0 pa-0" id="monaco-wrapper" fluid style="height: 640px;">
                  <MonacoEditor
                    :theme="theme === 'dark' ? 'vs-dark' : 'vs'"
                    :options="options"
                    language="json"
                    v-model:value="serverSettings"
                    @editorDidMount="storeEditorInstance"
                    @editorWillMount="editorWillMount"
                    v-show="tab === 'tab-server'"
                  ></MonacoEditor>
                </v-container>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-btn color="primary" type="submit">Save</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-window-item>
      </v-window>
    </v-container>
  </v-container>
</template>

<style scoped>
</style>
