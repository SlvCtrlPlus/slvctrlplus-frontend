<script setup lang="ts">
import { useAutomationStore } from "../stores/automation.js";
import MonacoEditor from "../components/automation/MonacoEditor.vue";
import { storeToRefs } from "pinia";
import { computed, reactive, ref } from "vue";
import { useAppStore } from "../stores/app";

const automationStore = useAutomationStore();
const appStore = useAppStore();

const button = reactive({
  label: "run",
  color: "primary",
  icon: "mdi-play",
});

const { currentScriptName, currentCode, scriptRunning } =
  storeToRefs(automationStore);

async function runScript(): Promise<void> {
  if (!scriptRunning.value) {
    automationStore
      .runScript()
      .then(() => {
        button.label = "stop";
        button.color = "red";
        button.icon = "mdi-stop";

        appStore.displaySnackbar(`Script execution started`);
      })
      .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
  } else {
    automationStore
      .stopScript()
      .then(() => {
        button.label = "run";
        button.color = "primary";
        button.icon = "mdi-play";

        appStore.displaySnackbar(`Script execution stopped`);
      })
      .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
  }
}

async function saveScript(): Promise<void> {
  automationStore
    .saveScript()
    .then(() => {
      appStore.displaySnackbar(
        `Automation script "${currentScriptName.value}" saved`
      );
    })
    .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
}

function createScript() {
  const scriptNameWithExt = `${newScriptName.value}.js`;

  automationStore.currentScriptName = scriptNameWithExt;
  automationStore.currentCode = "";

  automationStore
    .saveScript()
    .then(() => {
      automationStore.fetchScripts();
      automationStore.fetchScript(scriptNameWithExt);
      newScriptName.value = "";
      dialog.value = false;
    })
    .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
}

function changeScript(newScriptName: string): void {
  automationStore
    .fetchScript(newScriptName)
    .catch((e) => appStore.displaySnackbar(`${e.message}`, "red"));
}

setInterval(() => automationStore.fetchScripts(), 5000);
automationStore.fetchScripts();

const selectOptions = computed(() => {
  const files = [];

  for (const file of automationStore.scriptList) {
    files.push(file.fileName);
  }

  return files;
});

const dialog = ref(false);
const newScriptName = ref("");
const isValid = ref(true);

const scriptNameRules = [
  (value: string) => {
    if (value) return true;
    return "You must enter a script name.";
  },
  (value: string) => {
    if (value.length >= 3) return true;
    return "The script name needs to be at least 3 characters long.";
  },
  (value: string) => {
    if (value.length < 64) return true;
    return "The script name needs to no more than 64 characters long.";
  },
  (value: string) => {
    if (value.match(/^[a-z\d-_.]+$/)) return true;
    return "Only lower case letters, numbers, hyphens, underscores and dots are allowed.";
  },
];
</script>

<template>
  <v-container class="fill-height d-flex flex-column flex-nowrap" fluid>
    <v-row class="flex-grow-0 w-100">
      <v-col cols="12">
        <h2 class="text-h4 text-grey-darken-1 py-4">Automation</h2>
        <v-row class="mx-0">
          <v-select
            :items="selectOptions"
            v-model="currentScriptName"
            @update:modelValue="changeScript"
            hide-details="hide-details"
            density="compact"
          ></v-select>

          <v-btn color="primary" class="ml-3" @click="dialog = true">
            <v-icon start icon="mdi-plus"></v-icon>
            create
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="flex-grow-1 w-100">
      <v-col cols="12">
        <MonacoEditor
          v-model:code="currentCode"
          :onSave="saveScript"
          :readOnly="scriptRunning"
        ></MonacoEditor>
      </v-col>
    </v-row>
    <v-row class="flex-grow-0 w-100">
      <v-col cols="12">
        <v-row justify="space-between" class="mb-5 mt-1 mx-0">
          <v-btn :color="button.color" @click="runScript">
            <v-icon start :icon="button.icon"></v-icon>
            {{ button.label }}
          </v-btn>

          <v-btn color="grey-darken-1" @click="saveScript" :disabled="currentScriptName === null">
            <v-icon start icon="mdi-content-save"></v-icon>
            save
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="dialog" persistent>
    <v-form @submit.prevent v-model="isValid">
      <v-card>
        <v-card-title>
          <span class="text-h5">Create new script</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            label="Name*"
            required
            :rules="scriptNameRules"
            v-model="newScriptName"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            type="submit"
            :disabled="!isValid"
            @click="createScript"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<style scoped></style>
