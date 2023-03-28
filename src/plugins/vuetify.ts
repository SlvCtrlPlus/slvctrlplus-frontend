// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import type { App, Plugin } from "vue";
import type { ThemeDefinition } from "vuetify/dist/vuetify.js";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";

const dark: ThemeDefinition = {
  dark: true,
  colors: {
    primary: "#00BD7E",
    "primary-darken-1": "#008055",
    "primary-darken-2": "#004d33",
    "primary-darken-3": "#094732",
    secondary: "#03DAC6",
    "secondary-darken-1": "#018786",
    error: "#B00020",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    logo: "#eee",
  },
};

const light: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#00BD7E",
    "primary-darken-1": "#008055",
    "primary-darken-2": "#004d33",
    "primary-darken-3": "#094732",
    secondary: "#03DAC6",
    "secondary-darken-1": "#018786",
    error: "#B00020",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FB8C00",
    logo: "#222",
  },
};

export const vuetify: Plugin = {
  install: async (app: App, options: any): Promise<void> => {
    const vuetify = createVuetify({
      components,
      directives,
      icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
          mdi,
        },
      },
      theme: {
        defaultTheme: "dark",
        themes: {
          dark,
          light,
        },
      },
    });

    app.use(vuetify);
  },
};
