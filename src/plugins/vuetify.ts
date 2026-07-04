// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Vuetify
import { createVuetify } from 'vuetify';
import type { App, Plugin } from 'vue';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

const dark = {
  dark2: true,
  colors: {
    primary: '#00BD7E',
    'primary-darken-1': '#008055',
    'primary-darken-2': '#004d33',
    'primary-darken-3': '#094732',
    secondary: '#03DAC6',
    'secondary-darken-1': '#018786',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    logo: '#eee',
  },
};

const light = {
  dark: false,
  colors: {
    primary: '#00BD7E',
    'primary-darken-1': '#008055',
    'primary-darken-2': '#004d33',
    'primary-darken-3': '#094732',
    secondary: '#03DAC6',
    'secondary-darken-1': '#018786',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    logo: '#222',
  },
};

// In dev, vite-plugin-vuetify's per-component autoImport resolves to deep
// module paths (e.g. vuetify/components/VAlert) that Vite's optimizer
// discovers incrementally as different pages are visited, causing repeated
// "new dependencies optimized, reloading" full-page reloads. Registering the
// full components/directives sets upfront avoids that. Production builds
// still benefit from autoImport's tree-shaking since this branch is dropped
// at build time. Resolved at module top-level (not inside install()) so
// install() stays synchronous - main.ts calls app.use(vuetify) without
// awaiting it.
const [devComponents, devDirectives] = import.meta.env.DEV
  ? await Promise.all([import('vuetify/components'), import('vuetify/directives')])
  : [undefined, undefined];

export const vuetify: Plugin = {
  install: (app: App): void => {
    const vuetify = createVuetify({
      ...(devComponents && devDirectives
        ? { components: devComponents, directives: devDirectives }
        : {}),
      icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
      },
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark,
          light,
        },
      },
    });

    app.use(vuetify);
  },
};
