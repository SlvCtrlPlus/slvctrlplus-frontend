import { defineStore } from "pinia";

export type SettingsState = {
  serverUrl: string;
  theme: string;
};

export const useSettingsStore = defineStore({
  id: "settings",
  state: () =>
    ({
      serverUrl: `http://${location.hostname}:1337`,
      theme: "dark",
    } as SettingsState),
});
