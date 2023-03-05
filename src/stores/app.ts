import { defineStore } from "pinia";

export type AppState = {
  snackbar: {
    display: boolean;
    text: string;
    color: string;
    timeout: number;
  };
};

export const useAppStore = defineStore({
  id: "app",
  state: () => {
    return {
      snackbar: {
        display: false,
        text: "",
        color: "primary",
        timeout: 5000,
      },
    } as AppState;
  },
  actions: {
    displaySnackbar(text: string, color = "primary", timeout = 5000) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.timeout = timeout;
      this.snackbar.display = true;
    },
  },
});
