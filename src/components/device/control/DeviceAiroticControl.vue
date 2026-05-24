<script setup lang="ts">
import { HueSlider } from 'vue-color'
import { useSocketIO } from '@/plugins/vueSocketIOClient';
import type { Socket } from 'socket.io-client';
import DeviceCommunicator from '@/helper/DeviceCommunicator';
import type { DeviceAirotic } from '@/model/devices/airotic/DeviceAirotic';
import { ref } from 'vue';

interface Props {
  device: DeviceAirotic;
}

const props = defineProps<Props>();
const io = useSocketIO() as Socket;

const deviceComm = new DeviceCommunicator(props.device, io);
//const localDevice = reactive({ ...props.device });

const localRestColor = ref({ r: 0, g: 0, b: 0 });
const localBreathInColor = ref({ r: 0, g: 0, b: 0 });

</script>

<template>
  <dl>
    <dt><label>Rest color</label></dt>
    <dd>
      <v-color-picker
        v-model="localRestColor"
        mode="rgb"
        hide-inputs
        hide-eye-dropper
      />
      <!--HueSlider v-model:tinyColor="localRestColor" /-->
      <v-btn color="primary" @click="console.log(localRestColor); deviceComm.setAttribute('restColor', localRestColor.r + ',' + localRestColor.g + ',' + localRestColor.b)">
        Apply Color
      </v-btn>
    </dd>
  </dl>
  
  <dl class="my-4">
    <dt><label>Breath in color</label></dt>
    <dd>
      <v-color-picker
        v-model="localBreathInColor"
        mode="rgb"
        hide-inputs
        hide-eye-dropper
      />
      <v-btn color="primary" @click="console.log(localBreathInColor); deviceComm.setAttribute('breathInColor', localBreathInColor.r + ',' + localBreathInColor.g + ',' + localBreathInColor.b)">
        Apply Color
      </v-btn>
    </dd>
  </dl>

  <v-divider class="my-4"></v-divider>

  <v-btn class="mr-4" @click="console.log('Reset colors'); deviceComm.setAttribute('resetColors', true)">
    Reset Colors
  </v-btn>

  <v-btn  color="grey-darken-3" @click="console.log('Reboot'); deviceComm.setAttribute('reboot', true)">
    Reboot
  </v-btn>
</template>

<style scoped></style>
