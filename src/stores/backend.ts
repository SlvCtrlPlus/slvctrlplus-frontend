import { defineStore } from 'pinia'
import { ref } from "vue";


export const useBackendStore = defineStore('backend', () => {

    const backendUrl = ref<string|undefined>(localStorage.getItem('backendUrl') || '');
    const history = ref<string[]>(JSON.parse(localStorage.getItem('backendHistory') || '[]') as string[]);
    const isServerOnline = ref<boolean>(false);
    const wasServerEverOnline = ref<boolean>(false);

    function setBackendUrl(url: string): void {
        try {
            localStorage.setItem('backendUrl', url);
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
                localStorage.setItem('backendHistory', JSON.stringify(history.value));
            } catch (error) {
                console.error("Error saving backend history:", error);
            }
        }
    }

    function clearBackendUrl(): void {
        try {
            localStorage.removeItem('backendUrl');
            backendUrl.value = '';
            wasServerEverOnline.value = false;
            isServerOnline.value = false;
        } catch (error) {
            console.error("Error clearing backend URL:", error);
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
    };
});
