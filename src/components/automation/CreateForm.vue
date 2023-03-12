<script setup lang="ts">
import { ref } from "vue";
import { useAutomationStore } from "@/stores/automation.js";
import { useAppStore } from "@/stores/app.js";

const emit = defineEmits(["save"])

const appStore = useAppStore();
const automationStore = useAutomationStore();

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

function createScript(): void {
  const scriptNameWithExt = `${newScriptName.value}.js`;

  if (null !== automationStore.currentScriptName) {
    automationStore.currentCode = automationStore.getDefaultCode();
  }
  automationStore.currentScriptName = scriptNameWithExt;

  automationStore
    .saveScript()
    .then(() => {
      automationStore.fetchScripts();
      automationStore.fetchScript(scriptNameWithExt);
    })
    .then(() => {
      emit("save");
      newScriptName.value = "";
    })
    .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
}
</script>

<template>
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
        <v-btn color="grey" variant="text" @click="$emit('cancel')">
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
</template>
