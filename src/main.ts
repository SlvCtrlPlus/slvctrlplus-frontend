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

/*window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        console.log(`[Monaco] Loading worker for label: ${label}`);
        return `/monaco/${label}.worker.js`; // adjust path if needed
    }
};*/

loadFonts().catch(console.log);

const pinia = createPinia();

createApp(App)
  .use(pinia)
  .use(vueSocketIOClient, {
    connection: `http://${location.hostname}:1337`,
  })
  .use(router)
  .use(vuetify)
  .use(VueFullscreen)
  .mount("#app");
