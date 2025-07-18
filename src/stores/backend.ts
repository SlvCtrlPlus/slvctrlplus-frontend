import { defineStore } from 'pinia'
import { ref } from "vue";


export const useBackendStore = defineStore('backend', () => {

    const backendUrl = ref<string|undefined>(localStorage.getItem('backendUrl') || '');
    const history = ref<string[]>(JSON.parse(localStorage.getItem('backendHistory') || '[]') as string[]);

    function setBackendUrl(url: string) {
        backendUrl.value = url
        localStorage.setItem('backendUrl', url)

        if (!history.value.includes(url)) {
            history.value.unshift(url)
            localStorage.setItem('backendHistory', JSON.stringify(history.value))
        }
    }

    function clearBackendUrl() {
        backendUrl.value = ''
        localStorage.removeItem('backendUrl')
    }

    return {
        backendUrl,
        history,
        setBackendUrl,
        clearBackendUrl,
    };
});
