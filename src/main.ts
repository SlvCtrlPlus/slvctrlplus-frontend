import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { loadFonts } from "./plugins/webfontloader";
import { vueSocketIOClient } from "./plugins/vueSocketIOClient.js";
import { createPinia } from "pinia";
import { vuetify } from "./plugins/vuetify.js";
import VueFullscreen from "vue-fullscreen";
import {useBackendStore} from "@/stores/backend.ts";

loadFonts().catch(console.log);

const app = createApp(App).use(createPinia());
const backend = useBackendStore();

app
  .use(vueSocketIOClient, {
    connection: `${backend.backendUrl}`,
  })
  .use(router)
  .use(vuetify)
  .use(VueFullscreen)
  .mount("#app");
