import { useBackendStore } from '@/stores/backend';
import { useAppStore } from "@/stores/app";

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const backendStore = useBackendStore();
    const appStore = useAppStore();
    const backendUrl = backendStore.backendUrl;

    if (!backendUrl) {
        const errorMsg = 'No server is configured. Cannot perform request.';
        appStore.displaySnackbar(errorMsg);
        throw new Error(errorMsg);
    }

    return fetch(`${backendUrl}${path}`, {
        ...options,
        headers: {
            'Frontend-Version': appStore.getVersion(),
            ...(options?.headers || {}),
        },
    });
}
