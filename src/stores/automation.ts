import { defineStore } from "pinia";
import type AutomationScript from "../model/AutomationScript";

export type AutomationState = {
  scripts: AutomationScript[];
};

export const useAutomationStore = defineStore({
  id: "automation",
  state: () =>
    ({
      scripts: [],
    } as AutomationState),
  getters: {
    scriptList: (state) => Object.values(state.scripts),
  },
  actions: {
    loadScripts() {
      fetch(`http://${location.hostname}:1337/automation/scripts`)
        .then((response) => response.json())
        .then((data) => {
          this.scripts = [];

          data.items.forEach((v: AutomationScript) => {
            this.scripts.push(v);
          });
        })
        .catch(console.log);
    },
  },
});
