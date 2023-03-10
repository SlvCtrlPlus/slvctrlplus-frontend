import { defineStore } from "pinia";
import type AutomationScript from "../model/AutomationScript";

const defaultCode = `// Write your automation here. The script will fire on device events:
//
//  - deviceUpdateReceived: A device got updated through the external API
//  - deviceConnected: A new device was connected to SlvCtrl+
//  - deviceDisconnected: A device was disconnected from SlvCtrl+
//  - deviceRefreshed: New data has been pulled from a device
//
// You can get information about the event and the device that invoked your script through the global "event"
// variable. To access other devices you can use the global variable "devices" -> devices.getById(\`{device uuid}\`)
`;

export type AutomationState = {
  scripts: AutomationScript[];
  currentScriptName: string | null;
  currentCode: string;
  scriptRunning: boolean;
  runningSince: Date | null;
  logMessages: string[];
};

export const useAutomationStore = defineStore({
  id: "automation",
  state: () =>
    ({
      scripts: [],
      currentScriptName: null,
      currentCode: defaultCode,
      scriptRunning: false,
      runningSince: null,
      logMessages: [],
    } as AutomationState),
  getters: {
    scriptList: (state) => Object.values(state.scripts),
  },
  actions: {
    init() {
      fetch(`http://${location.hostname}:1337/automation/status`)
        .then((response) => response.json())
        .then((data) => {
          this.runningSince = new Date(data.runningSince);
          this.scriptRunning = data.running;
        })
        .catch(console.log);
    },
    fetchScripts(): Promise<AutomationScript[]> {
      return fetch(`http://${location.hostname}:1337/automation/scripts`)
        .then((response) => {
          if (200 !== response.status) {
            throw new Error(`Could not fetch scripts: ${response.statusText}`);
          }

          return response.json();
        })
        .then((data) => {
          this.scripts = [];

          data.items.forEach((v: AutomationScript) => {
            this.scripts.push(v);
          });

          console.log("List of scripts updated");

          return this.scripts;
        });
    },
    fetchScript(scriptName: string): Promise<string> {
      this.currentScriptName = scriptName;

      return fetch(
        `http://${location.hostname}:1337/automation/scripts/${scriptName}`
      )
        .then((response) => {
          if (200 !== response.status) {
            throw new Error(
              `Could not fetch script ${scriptName}: ${response.statusText}`
            );
          }

          return response.text();
        })
        .then((data) => {
          this.currentCode = data;
          console.log(`Script loaded: ${this.currentScriptName}`);

          return data;
        });
    },
    saveScript(): Promise<void> {
      return fetch(
        `http://${location.hostname}:1337/automation/scripts/${this.currentScriptName}`,
        {
          headers: {
            "Content-Type": "text/plain",
          },
          method: "POST",
          body: this.currentCode,
        }
      ).then((response: Response) => {
        if (201 !== response.status) {
          throw new Error(
            `Could not save script "${this.currentScriptName}": ${response.statusText}`
          );
        }
      });
    },
    deleteScript(scriptName: string): Promise<void> {
      return fetch(
        `http://${location.hostname}:1337/automation/scripts/${scriptName}`,
        {
          headers: {
            "Content-Type": "text/plain",
          },
          method: "DELETE",
        }
      ).then((response: Response) => {
        if (204 !== response.status) {
          throw new Error(
            `Could not delete script "${this.currentScriptName}": ${response.statusText}`
          );
        }
      });
    },
    runScript(): Promise<void> {
      return fetch(`http://${location.hostname}:1337/automation/run`, {
        headers: {
          "Content-Type": "text/plain",
        },
        method: "POST",
        body: this.currentCode,
      })
        .then((response) => {
          if (200 !== response.status) {
            throw new Error(`Could not run script: ${response.statusText}`);
          }

          this.logMessages = [];
          this.scriptRunning = true;

          return response;
        })
        .then((response) => response.json())
        .then((data) => {
          this.runningSince = new Date(data.runningSince);
          this.scriptRunning = data.running;
        });
    },
    stopScript(): Promise<void> {
      return fetch(`http://${location.hostname}:1337/automation/stop`).then(
        (response) => {
          if (200 !== response.status) {
            throw new Error(`Could not stop script: ${response.statusText}`);
          }

          this.scriptRunning = false;
        }
      );
    },
    getDefaultCode(): string {
      return defaultCode;
    },
  },
});
