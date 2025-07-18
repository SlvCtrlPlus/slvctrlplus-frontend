import { defineStore } from 'pinia'
import { ref } from "vue";


export const useBackendStore = defineStore('backend', () => {

    const backendUrl = ref<string|undefined>(localStorage.getItem('backendUrl') || '');
    const history = ref<string[]>(JSON.parse(localStorage.getItem('backendHistory') || '[]') as string[]);
    const isServerOnline = ref<boolean>(false);
    const wasSeverEverOnline = ref<boolean>(false);

    function setBackendUrl(url: string): void {
        backendUrl.value = url
        localStorage.setItem('backendUrl', url)

        if (!history.value.includes(url)) {
            history.value.unshift(url)
            localStorage.setItem('backendHistory', JSON.stringify(history.value))
        }
    }

    function clearBackendUrl(): void {
        backendUrl.value = ''
        localStorage.removeItem('backendUrl')
    }

    function setServerOnline(status: boolean): void {
        isServerOnline.value = status;

        if (status) {
            wasSeverEverOnline.value = true;
        }
    }

    return {
        backendUrl,
        history,
        isServerOnline,
        wasSeverEverOnline,

        setServerOnline,
        setBackendUrl,
        clearBackendUrl,
    };
});
