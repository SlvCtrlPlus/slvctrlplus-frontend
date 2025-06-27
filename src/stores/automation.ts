import { defineStore } from "pinia";
import { ref, computed } from "vue";
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

export const useAutomationStore = defineStore("automation", () => {
    // State
    const scripts = ref<AutomationScript[]>([]);
    const currentScriptName = ref<string | null>(null);
    const currentCode = ref<string>(defaultCode);
    const scriptRunning = ref(false);
    const runningSince = ref<Date | null>(null);
    const logMessages = ref<string[]>([]);

    // Getter (computed)
    const scriptList = computed(() => Object.values(scripts.value));

    // Actions
    function init() {
        fetch(`http://${location.hostname}:1337/automation/status`)
            .then((response) => response.json())
            .then((data) => {
                runningSince.value = new Date(data.runningSince);
                scriptRunning.value = data.running;
            })
            .catch(console.log);
    }

    async function fetchScripts(): Promise<AutomationScript[]> {
        const response = await fetch(`http://${location.hostname}:1337/automation/scripts`);
        if (response.status !== 200) {
            throw new Error(`Could not fetch scripts: ${response.statusText}`);
        }
        const data = await response.json();
        scripts.value = [];
        data.items.forEach((v: AutomationScript) => {
            scripts.value.push(v);
        });
        console.log("List of scripts updated");
        return scripts.value;
    }

    async function fetchScript(scriptName: string): Promise<string> {
        currentScriptName.value = scriptName;

        const response = await fetch(`http://${location.hostname}:1337/automation/scripts/${scriptName}`);
        if (response.status !== 200) {
            throw new Error(`Could not fetch script ${scriptName}: ${response.statusText}`);
        }
        const data = await response.text();
        currentCode.value = data;
        console.log(`Script loaded: ${currentScriptName.value}`);
        return data;
    }

    async function saveScript(): Promise<void> {
        if (!currentScriptName.value) throw new Error("No script selected to save");

        const response = await fetch(`http://${location.hostname}:1337/automation/scripts/${currentScriptName.value}`, {
            headers: { "Content-Type": "text/plain" },
            method: "POST",
            body: currentCode.value,
        });
        if (response.status !== 201) {
            throw new Error(`Could not save script "${currentScriptName.value}": ${response.statusText}`);
        }
    }

    async function deleteScript(scriptName: string): Promise<void> {
        const response = await fetch(`http://${location.hostname}:1337/automation/scripts/${scriptName}`, {
            headers: { "Content-Type": "text/plain" },
            method: "DELETE",
        });
        if (response.status !== 204) {
            throw new Error(`Could not delete script "${scriptName}": ${response.statusText}`);
        }
    }

    async function runScript(): Promise<void> {
        const response = await fetch(`http://${location.hostname}:1337/automation/run`, {
            headers: { "Content-Type": "text/plain" },
            method: "POST",
            body: currentCode.value,
        });
        if (response.status !== 200) {
            throw new Error(`Could not run script: ${response.statusText}`);
        }
        logMessages.value = [];
        scriptRunning.value = true;

        const data = await response.json();
        runningSince.value = new Date(data.runningSince);
        scriptRunning.value = data.running;
    }

    async function stopScript(): Promise<void> {
        const response = await fetch(`http://${location.hostname}:1337/automation/stop`);
        if (response.status !== 200) {
            throw new Error(`Could not stop script: ${response.statusText}`);
        }
        scriptRunning.value = false;
    }

    function getDefaultCode(): string {
        return defaultCode;
    }

    return {
        // state
        scripts,
        currentScriptName,
        currentCode,
        scriptRunning,
        runningSince,
        logMessages,
        // getters
        scriptList,
        // actions
        init,
        fetchScripts,
        fetchScript,
        saveScript,
        deleteScript,
        runScript,
        stopScript,
        getDefaultCode,
    };
});
