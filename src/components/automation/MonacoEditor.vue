<script setup lang="ts">
import { useSettingsStore } from "../../stores/settings.js";
import MonacoEditor from "monaco-editor-vue3";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { storeToRefs } from "pinia";
import { KeyCode, KeyMod } from "monaco-editor";
import { watch } from "vue";

const settingsStore = useSettingsStore();

const { theme } = storeToRefs(settingsStore);

interface Props {
  code: string;
  readOnly: boolean;
  onSave: () => void;
}

const props = defineProps<Props>();

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

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
const options: monaco.editor.IEditorOptions = {
  fontSize: 16,
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
};

window.addEventListener('resize', () => {
  if (editorInstance === null) {
    return;
  }
  // make editor as small as possible
  editorInstance.layout({ width: 0, height: 0 })

  // wait for next frame to ensure last layout finished
  window.requestAnimationFrame(() => {
    const monacoElement = document.getElementById("monaco-wrapper");

    if (null === editorInstance || null === monacoElement) {
      return;
    }

    // get the parent dimensions and re-layout the editor
    const rect = monacoElement.getBoundingClientRect();
    editorInstance.layout({ width: rect.width, height: rect.height });
  });
});

function storeEditorInstance(
  editor: monaco.editor.IStandaloneCodeEditor
): void {
  editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, (): void => {
    props.onSave();
  });
  editorInstance = editor;
}

watch(
  () => props.readOnly,
  (value) => {
    if (editorInstance != null) {
      editorInstance.updateOptions({ readOnly: value });
    }
  }
);

const emit = defineEmits(["update:code"]);

const updateValue = (event) => emit("update:code", event);
</script>

<template>
  <v-container class="fill-height ma-0 pa-0" id="monaco-wrapper" fluid>
    <MonacoEditor

      :theme="theme === 'dark' ? 'vs-dark' : 'vs'"
      :options="options"
      language="javascript"
      :value="props.code"
      @change="updateValue"
      @editorDidMount="storeEditorInstance"
    ></MonacoEditor>
  </v-container>
</template>
