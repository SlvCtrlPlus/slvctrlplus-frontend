<script setup lang="ts">
import { useAutomationStore } from "@/stores/automation.js";
import MonacoEditor from "@/components/automation/MonacoEditor.vue";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useAppStore } from "@/stores/app.js";
import CreateForm from "@/components/automation/CreateForm.vue";
import type AutomationScript from "@/model/AutomationScript.js";
import LogViewer from "@/components/automation/LogViewer.vue";

const automationStore = useAutomationStore();
const appStore = useAppStore();

const {
  currentScriptName,
  currentCode,
  scriptRunning,
  logMessages,
  runningSince,
} = storeToRefs(automationStore);

const button = computed(() => {
  if (scriptRunning.value) {
    return {
      label: "stop",
      color: "red",
      icon: "mdi-stop",
    };
  } else {
    return {
      label: "run",
      color: "primary",
      icon: "mdi-play",
    };
  }
});

async function runScript(): Promise<void> {
  if (!scriptRunning.value) {
    automationStore
      .runScript()
      .then(() => {
        appStore.displaySnackbar(`Script execution started`);
      })
      .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
  } else {
    automationStore
      .stopScript()
      .then(() => {
        appStore.displaySnackbar(`Script execution stopped`);
      })
      .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
  }
}

async function saveScript(): Promise<void> {
  // If there's no currentScriptName to save the content to
  // we ask for a new script name, else we save the content
  // to the currently selected scriptName
  if (null === currentScriptName.value) {
    showCreateDialog.value = true;
    return;
  }

  automationStore
    .saveScript()
    .then(() => {
      appStore.displaySnackbar(
        `Automation script "${currentScriptName.value}" saved`
      );
    })
    .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
}

function changeScript(newScriptName: string): void {
  automationStore
    .fetchScript(newScriptName)
    .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
}

function deleteScript(): void {
  automationStore
    .deleteScript(itemKeyDelete.value)
    .then(() => automationStore.fetchScripts())
    .then(() => console.log(`delete: ${itemKeyDelete.value}`))
    .then(() => {
      if (itemKeyDelete.value === currentScriptName.value) {
        currentScriptName.value = null;
        currentCode.value = automationStore.getDefaultCode();
      }

      itemKeyDelete.value = "";
      showDeleteDialog.value = false;
    })
    .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
}

function displayDeleteDialog(scriptName: string): void {
  itemKeyDelete.value = scriptName;
  showDeleteDialog.value = true;
}

setInterval(() => automationStore.fetchScripts(), 5000);
automationStore.fetchScripts();

const selectOptions = computed(() =>
  automationStore.scriptList.map((file: AutomationScript) => file.fileName)
);

const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const showLogDialog = ref(false);
const itemKeyDelete = ref("");
</script>

<template>
  <v-container class="fill-height d-flex flex-column flex-nowrap" fluid>
    <v-row class="flex-grow-0 w-100">
      <v-col cols="12">
        <h2 class="text-h4 text-grey-darken-1 py-4">Automation</h2>
        <v-row class="mx-0 mt-3">
          <v-select
            :items="selectOptions"
            v-model="currentScriptName"
            @update:modelValue="changeScript"
            hide-details="hide-details"
            density="compact"
            :disabled="scriptRunning"
          >
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <template v-slot:append>
                  <v-icon
                    icon="mdi-trash-can"
                    @click.stop="displayDeleteDialog(item.value)"
                  />
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-btn
            color="primary"
            class="ml-3"
            @click="showCreateDialog = true"
            :disabled="scriptRunning"
          >
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
          <v-sheet>
            <v-btn :color="button.color" @click="runScript">
              <v-icon start :icon="button.icon"></v-icon>
              {{ button.label }}
            </v-btn>
            <v-btn
              color="grey-darken-1"
              class="ml-3"
              @click="showLogDialog = true"
              v-if="scriptRunning"
            >
              <v-icon start icon="mdi-note-text-outline"></v-icon>
              logs
            </v-btn>
          </v-sheet>
          <v-btn
            color="grey-darken-1"
            @click="saveScript"
            :disabled="scriptRunning"
          >
            <v-icon start icon="mdi-content-save"></v-icon>
            save
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="showDeleteDialog" persistent>
    <v-card>
      <v-card-title class="text-h5"> Delete script </v-card-title>
      <v-card-text
        >Are you sure you want to delete script <b>{{ itemKeyDelete }}</b
        >?</v-card-text
      >
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="showDeleteDialog = false">
          Cancel
        </v-btn>
        <v-btn color="primary" variant="text" @click="deleteScript">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showCreateDialog" persistent>
    <CreateForm
      @save="showCreateDialog = false"
      @cancel="showCreateDialog = false"
    />
  </v-dialog>

  <v-dialog v-model="showLogDialog" persistent>
    <LogViewer
      :logData="logMessages"
      :runningSince="runningSince"
      @close="showLogDialog = false"
    />
  </v-dialog>
</template>
