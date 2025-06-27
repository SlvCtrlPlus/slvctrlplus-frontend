import { defineStore } from "pinia";
import { ref } from "vue";

type ValidationErrors = {
  message: string;
  errors: ValidationError[];
}

type ValidationError = {
    message: string;
    instancePath: string;
    schemaPath: string;
    keyword: string;
}

export const useSettingsStore = defineStore("serverSettings", () => {
  // state as refs
  const serverUrl = ref(`http://${location.hostname}:1337`);
  const theme = ref("dark");
  const serverSettings = ref("");
  const validationErrors = ref<ValidationErrors|null>(null);

  // actions
  async function init() {
    await getServerSettings();
  }

  async function saveServerSettings(): Promise<void> {
    console.log("save settings to server", serverSettings.value);
    // your saving logic here

    const response = await fetch(`http://${location.hostname}:1337/settings`, {
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      method: "PUT",
      body: serverSettings.value,
    });
    if (response.status !== 200) {
      if (response.status === 400) {
        validationErrors.value = await response.json();
      }
      throw new Error(`Could not save server settings: ${response.statusText}`);
    }

    validationErrors.value = null;
    serverSettings.value = await response.text();
  }

  async function getServerSettings(): Promise<void> {
    const response = await fetch(`${serverUrl.value}/settings`);
    if (response.status !== 200) {
      throw new Error(`Could not get settings from server: ${response.statusText}`);
    }
    serverSettings.value = await response.text();
  }

  // return state and actions
  return {
    serverUrl,
    theme,
    serverSettings,
    validationErrors,
    init,
    saveServerSettings,
    getServerSettings,
  };
});
