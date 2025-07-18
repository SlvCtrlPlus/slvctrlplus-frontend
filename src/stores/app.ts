import { defineStore } from "pinia";
import { reactive } from "vue";

export type AppState = {
  snackbar: {
    display: boolean;
    text: string;
    color: string;
    timeout: number;
  };
  displaySnackbar(
      text: string,
      color: string,
      timeout: number,
  ): void;
  getVersion(): string;
};

export const useAppStore = defineStore("app", (): AppState => {
  // reactive state
  const snackbar = reactive<AppState["snackbar"]>({
    display: false,
    text: "",
    color: "primary",
    timeout: 5000,
  });

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

  function getVersion(): string {
    return import.meta.env.VITE_APP_VERSION || 'n/a';
  }

  return {
    snackbar,

    displaySnackbar,
    getVersion,
  };
});
