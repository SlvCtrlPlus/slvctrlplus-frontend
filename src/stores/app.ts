import { defineStore } from "pinia";
import {reactive, ref} from "vue";

export type AppState = {
  isServerOnline: boolean,
  wasSeverEverOnline: boolean,
  snackbar: {
    display: boolean;
    text: string;
    color: string;
    timeout: number;
  };
};

export const useAppStore = defineStore("app", () => {
  // reactive state
  const snackbar = reactive<AppState["snackbar"]>({
    display: false,
    text: "",
    color: "primary",
    timeout: 5000,
  });

  const isServerOnline = ref<AppState["isServerOnline"]>(false);
  const wasSeverEverOnline = ref<AppState["wasSeverEverOnline"]>(false);

  // actions
  function displaySnackbar(
      text: string,
      color = "primary",
      timeout = 5000
  ) {
    snackbar.text = text;
    snackbar.color = color;
    snackbar.timeout = timeout;
    snackbar.display = true;
  }

  function setServerOnline(status: boolean): void {
    isServerOnline.value = status;

    if (status) {
      wasSeverEverOnline.value = true;
    }
  }

  function getVersion(): string {
    return import.meta.env.VITE_APP_VERSION || 'n/a';
  }

  return {
    snackbar,
    displaySnackbar,
    isServerOnline,
    wasSeverEverOnline,

    setServerOnline,
    getVersion,
  };
});
