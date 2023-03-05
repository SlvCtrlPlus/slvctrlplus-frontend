<script setup lang="ts">
import { useAutomationStore } from "../stores/automation.js";
import MonacoEditor from "monaco-editor-vue3";
import { useSettingsStore } from "../stores/settings";
import { storeToRefs } from "pinia";
import { computed, reactive, ref } from "vue";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useAppStore } from "../stores/app";
import { KeyCode, KeyMod } from "monaco-editor/esm/vs/editor/editor.api";

const automationStore = useAutomationStore();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
let running = false;

// extra libraries
const libSource = `
interface Device
{
    getDeviceId: string
    getAttribute(attrName: string): bool|number|string
    setAttribute(attrName: string, value: string): void
}
enum DeviceEventType {
    deviceUpdateReceived = "deviceUpdateReceived",
    deviceConnected = "deviceConnected",
    deviceDisconnected = "deviceDisconnected",
    deviceRefreshed = "deviceRefreshed",
}
type DeviceEvent = { type: DeviceEventType, device: Device }
interface DeviceRepositoryInterface
{
    getAll(): Device[];
    getById(uuid: string): Device|null;
}
declare const event: DeviceEvent;
declare const devices: DeviceRepositoryInterface;
declare const context: { [key: string]: string };
`;
const libUri = "ts:filename/facts.d.ts";

const compilerOptions = {
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  lib: ["es2020"],
  allowNonTsExtensions: true,
};

monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri);
monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
  compilerOptions
);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
  compilerOptions
);
// When resolving definitions and references, the editor will try to use created models.

const button = reactive({
  label: "run",
  color: "primary",
  icon: "mdi-play",
});
const code =
  ref(`// Write your automation here. The script will fire on device events:
//
//  - deviceUpdateReceived: A device got updated through the external API
//  - deviceConnected: A new device was connected to SlvCtrl+
//  - deviceDisconnected: A device was disconnected from SlvCtrl+
//  - deviceRefreshed: New data has been pulled from a device
//
// You can get information about the event and the device that invoked your script through the global "event" variable.
// To access other devices you can use the global variable "devices" -> devices.getById(\`{device uuid}\`)
`);

const { theme } = storeToRefs(settingsStore);
const options: monaco.editor.IEditorOptions = {
  fontSize: 16,
  scrollBeyondLastLine: false,
};
const refOptions = reactive(options);
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

async function runScript(): Promise<void> {
  if (running) {
    return fetch(`http://${location.hostname}:1337/automation/stop`).then(() => {
      running = false;
      button.label = "run";
      button.color = "primary";
      button.icon = "mdi-play";

      appStore.displaySnackbar(`Script execution stopped`);
    });
  } else {
    const newCode = editorInstance.getModel().getValue();

    return fetch(`http://${location.hostname}:1337/automation/run`, {
      headers: {
        "Content-Type": "text/plain",
      },
      method: "POST",
      body: newCode,
    }).then(() => {
      running = true;
      button.label = "stop";
      button.color = "red";
      button.icon = "mdi-stop";

      appStore.displaySnackbar(`Script execution started`);
    });
  }

  if (editorInstance != null) {
    editorInstance.updateOptions({ readOnly: running });
  }
}

async function saveScript(): Promise<void> {
  const newCode = editorInstance.getModel().getValue();

  return fetch(
    `http://${location.hostname}:1337/automation/scripts/${currentFile.value}`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
      method: "POST",
      body: newCode,
    }
  ).then(() => {
    appStore.displaySnackbar(`Automation script "${currentFile.value}" saved`);
  });
}

function storeEditorInstance(
  editor: monaco.editor.IStandaloneCodeEditor
): void {
  editorInstance = editor;
  editorInstance.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, (): void => {
    saveScript();
  });
}

function changeFile(value: string) {
  console.log(value);

  fetch(`http://${location.hostname}:1337/automation/scripts/${value}`)
    .then((response) => response.text())
    .then((data) => {
      editorInstance.getModel().setValue(data);
    })
    .catch(console.log);
}

setInterval(() => automationStore.loadScripts(), 5000);
automationStore.loadScripts();

const selectOptions = computed(() => {
  const files = [];

  for (const file of automationStore.scriptList) {
    files.push(file.fileName);
  }

  return files;
});

const currentFile = ref("");
</script>

<template>
  <v-container fluid class="px-8">
    <h2 class="text-h4 text-grey-darken-1 py-4">Automation</h2>
    <v-select
      :items="selectOptions"
      v-model="currentFile"
      @update:modelValue="changeFile"
    ></v-select>
    <MonacoEditor
      :theme="theme === 'dark' ? 'vs-dark' : 'vs'"
      :options="refOptions"
      language="javascript"
      width="100%"
      :height="600"
      v-model:value="code"
      @editorDidMount="storeEditorInstance"
    ></MonacoEditor>
    <v-row justify="space-between" class="mt-5 mx-0">
      <v-btn :color="button.color" @click="runScript()">
        <v-icon start :icon="button.icon"></v-icon>
        {{ button.label }}
      </v-btn>

      <v-btn color="grey-darken-1" @click="saveScript()">
        <v-icon start icon="mdi-content-save"></v-icon>
        save
      </v-btn>
    </v-row>
  </v-container>
</template>

<style scoped></style>
