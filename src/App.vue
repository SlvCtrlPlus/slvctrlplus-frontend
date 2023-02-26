<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from "vue";
import {useDevicesStore} from "./stores/devices.js";
import {useSocketIO} from "./plugins/vueSocketIOClient.js";
import type {Socket} from "socket.io-client";
import type Device from "./model/Device.js";
import {useSettingsStore} from "./stores/settings.js";
import {storeToRefs} from "pinia";

let drawer = ref(false);
let snackbar = ref({
  display: false,
  text: '',
  color: 'primary',
  timeout: 5000,
});
const menuItems = [
  {
    title: 'Mission Control',
    to: '/mission-control',
    icon: 'mdi-rocket-launch'
  },
  {
    title: 'Automation',
    to: '/automation',
    icon: 'mdi-play'
  },
  {
    title: 'Devices',
    to: '/devices',
    icon: 'mdi-devices'
  },
  {
    title: 'System health',
    to: '/health',
    icon: 'mdi-heart'
  },
  {
    title: 'Settings',
    to: '/settings',
    icon: 'mdi-cog'
  },
];

const io = useSocketIO() as Socket;
const settingsStore = useSettingsStore();

const { theme } = storeToRefs(settingsStore);

const devicesStore = useDevicesStore();
devicesStore.init();

io.on('deviceDisconnected', device => {
  devicesStore.removeDevice(device);

  snackbar.value.text = `Device "${(device as Device).deviceName}" (${(device as Device).type}) disconnected`
  snackbar.value.display = true;
});
io.on('deviceConnected', device => {
  devicesStore.addDevice(device);

  snackbar.value.text = `Device "${(device as Device).deviceName}" (${(device as Device).type}) connected`
  snackbar.value.display = true;
});
io.on('deviceRefreshed', device => {
  devicesStore.updateDevice(device);
});
</script>

<template>
  <v-app :theme="theme" class="mx-auto overflow-hidden">
    <v-app-bar prominent>
      <v-app-bar-nav-icon color="primary" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title color="logo">SlvCtrl+</v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="text-grey-darken-3">v0.1.0-alpha</span>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        absolute
        bottom
        temporary
    >
      <v-list>
        <v-list-item active-color="primary" v-for="item in menuItems" :prepend-icon="item.icon" :title="item.title" :to="item.to" link></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <RouterView />

      <v-snackbar v-model="snackbar.display" :timeout="snackbar.timeout" :color="snackbar.color" class="mb-10">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn text @click="snackbar.display = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-main>
  </v-app>
</template>

<style>
.v-toolbar-title {
  font-family: Impact, sans-serif;
}
</style>
