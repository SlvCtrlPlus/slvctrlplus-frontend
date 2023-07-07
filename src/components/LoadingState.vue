<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height" align-content="center" justify="center">
      <v-col cols="12" class="text-subtitle-1 text-center">
        {{ msg }}
      </v-col>
      <v-col cols="12" class="text-subtitle-1 text-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
