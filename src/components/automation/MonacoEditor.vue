<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings.js";
import { storeToRefs } from "pinia";
import {defineAsyncComponent, watch} from "vue";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

// Load Monaco Editor asynchronously for performance reasons
const MonacoEditor = defineAsyncComponent(() => import('monaco-editor-vue3'));

const settingsStore = useSettingsStore();

const { theme } = storeToRefs(settingsStore);

interface Props {
  code: string;
  readOnly: boolean;
  onSave: () => void;
}

const props = defineProps<Props>();

let monacoInstanceGlobal: typeof monaco | null = null;
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

const options: monaco.editor.IEditorOptions = {
  fontSize: 16,
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
};

window.addEventListener("resize", () => {
  if (editorInstance === null) {
    return;
  }
  // make editor as small as possible
  editorInstance.layout({ width: 0, height: 0 });

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

function editorWillMount(monacoInstance: typeof monaco): void {
  // Store global Monaco Editor for performance reasons
  monacoInstanceGlobal = monacoInstance;

  // extra libraries
  const libSource = `
interface Device
{
    getDeviceId: string
    getAttribute(attrName: string): bool|number|string
    setAttribute(attrName: string, value: bool|number|string): void
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
declare const context: { [key: string]: any };
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  trace: (...args: any[]) => void;
};
`;
  const libUri = "ts:filename/facts.d.ts";

  const compilerOptions = {
    target: monacoInstance.languages.typescript.ScriptTarget.ES2020,
    lib: ["es2020"],
    allowNonTsExtensions: true,
  };

  monacoInstance.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
  monacoInstance.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri);
  monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions(
      compilerOptions
  );
  monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: [1108], // suppress "return not in function"
  });
}

function storeEditorInstance(
  editor: monaco.editor.IStandaloneCodeEditor,
): void {
  if (monacoInstanceGlobal !== null) {
    // Use global Monaco Editor here for performance reasons
    editor.addCommand(monacoInstanceGlobal.KeyMod.CtrlCmd | monacoInstanceGlobal.KeyCode.KeyS, (): void => {
      props.onSave();
    });
  }
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

const updateValue = (event: string) => emit("update:code", event);
</script>

<template>
  <v-container class="fill-height ma-0 pa-0" id="monaco-wrapper" fluid>
    <MonacoEditor
      :theme="theme === 'dark' ? 'vs-dark' : 'vs'"
      :options="options"
      language="typescript"
      :value="props.code"
      @change="updateValue"
      @editorDidMount="storeEditorInstance"
      @editorWillMount="editorWillMount"
    ></MonacoEditor>
  </v-container>
</template>
