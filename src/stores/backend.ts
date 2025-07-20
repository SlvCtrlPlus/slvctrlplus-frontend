import { defineStore } from 'pinia'
import { ref } from "vue";


export const useBackendStore = defineStore('backend', () => {

    const backendUrl = ref<string|undefined>(localStorage.getItem('backendUrl') || '');
    const history = ref<string[]>(JSON.parse(localStorage.getItem('backendHistory') || '[]') as string[]);
    const isServerOnline = ref<boolean>(false);
    const wasServerEverOnline = ref<boolean>(false);

    const historyLocalStoreName = 'backendHistory';
    const backendUrlLocalStoreName = 'backendUrl';

    function setBackendUrl(url: string): void {
        try {
            localStorage.setItem(backendUrlLocalStoreName, url);
            backendUrl.value = url;
        } catch (error) {
            console.error("Error setting backend URL:", error);
        }

        if (!history.value.includes(url)) {
            history.value.unshift(url);

            if (history.value.length > 5) {
                history.value.pop(); // Keep only the last few entries
            }

            try {
                localStorage.setItem(historyLocalStoreName, JSON.stringify(history.value));
            } catch (error) {
                console.error("Error saving backend history:", error);
            }
        }
    }

    function clearBackendUrl(): void {
        try {
            localStorage.removeItem(backendUrlLocalStoreName);
            backendUrl.value = '';
            wasServerEverOnline.value = false;
            isServerOnline.value = false;
        } catch (error) {
            console.error("Error clearing backend URL:", error);
        }
    }

    function removeBackendUrlFromHistory(url: string) {
        const index = history.value.indexOf(url);
        if (index === -1) {
            return;
        }

        history.value.splice(index, 1);

        try {
            localStorage.setItem(historyLocalStoreName, JSON.stringify(history.value));
        } catch (error) {
            console.error("Error saving backend history:", error);
        }
    }

    function setServerOnline(status: boolean): void {
        isServerOnline.value = status;

        if (status) {
            wasServerEverOnline.value = true;
        }
    }

    return {
        backendUrl,
        history,
        isServerOnline,
        wasServerEverOnline,

        setServerOnline,
        setBackendUrl,
        clearBackendUrl,
        removeBackendUrlFromHistory,
    };
});
