<script setup lang="ts">
import { ref } from "vue";
import { useAutomationStore } from "../stores/automation";
import { storeToRefs } from "pinia";
import { useAppStore } from "../stores/app";

const drawer = ref(false);
const menuItems = [
  {
    title: "Mission Control",
    to: "/mission-control",
    icon: "mdi-rocket-launch",
  },
  {
    title: "Automation",
    to: "/automation",
    icon: "mdi-play",
  },
  {
    title: "Devices",
    to: "/devices",
    icon: "mdi-devices",
  },
  {
    title: "System health",
    to: "/health",
    icon: "mdi-heart",
  },
  {
    title: "Settings",
    to: "/settings",
    icon: "mdi-cog",
  },
];

const appStore = useAppStore();
const automationStore = useAutomationStore();

const { snackbar } = storeToRefs(appStore);

function stopScript() {
  automationStore
    .stopScript()
    .then(() => {
      appStore.displaySnackbar(`Script execution stopped`);
    })
    .catch((e: Error) => appStore.displaySnackbar(`${e.message}`, "red"));
}
</script>

<template>
  <v-app-bar prominent>
    <v-app-bar-nav-icon
      color="primary"
      @click.stop="drawer = !drawer"
    ></v-app-bar-nav-icon>
    <v-toolbar-title color="logo">SlvCtrl+</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-sheet v-if="automationStore.scriptRunning" class="mr-5">
      <v-btn
        size="small"
        icon="mdi-stop"
        variant="elevated"
        color="red"
        @click="stopScript"
      />
    </v-sheet>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" absolute bottom temporary>
    <v-list>
      <v-list-item
        color="primary"
        v-for="item in menuItems"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        :key="item.to"
        link
      ></v-list-item>
    </v-list>
    <v-divider />
    <v-sheet class="text-grey-darken-3 text-center pa-3">v0.1.0-alpha</v-sheet>
  </v-navigation-drawer>

  <v-main>
    <RouterView />

    <v-snackbar
      v-model="snackbar.display"
      :timeout="snackbar.timeout"
      :color="snackbar.color"
      class="mb-10"
    >
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn text="" @click="snackbar.display = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-main>
</template>

<style>
.v-toolbar-title {
  font-family: Impact, sans-serif;
}
</style>
