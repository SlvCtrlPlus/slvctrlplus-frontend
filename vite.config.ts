import path from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import monacoEditorPlugin from 'vite-plugin-monaco-editor-esm';
import vuetify from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    port: 3000,
  },
  plugins: [
    vue(),
    vueJsx(),
    // autoImport injects a per-component deep import (e.g.
    // vuetify/components/VAlert) into every .vue file that uses it. In dev
    // that makes Vite's dependency scanner discover new deps incrementally
    // as different pages are visited, causing repeated full-page reloads. Only
    // enable it for the production build (tree-shaking win there); in dev,
    // plugins/vuetify.ts registers the full components/directives sets
    // globally instead, so autoImport isn't needed anyway.
    vuetify({ autoImport: command === 'build' }),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json', 'typescript'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
