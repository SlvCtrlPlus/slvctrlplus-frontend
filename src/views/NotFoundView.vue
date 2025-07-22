<script lang="ts" setup>
const quotes = [
    `You're lost - and somehow, that’s kind of hot.`,
    `Not all those who wander are lost.`,
    `Sometimes you have to get lost to find yourself.`,
    `I’m not lost. I’m exploring.`,
];
const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height" align-content="center" justify="center">
      <v-col cols="12" class="text-center">
        <h2 class="text-h2 text-grey-darken-1 py-4"><v-icon icon="mdi-robot-dead-outline" color="primary" class="mb-8" /><br>404 Not Found</h2>
      </v-col>
      <v-col cols="12" class="text-subtitle-1 text-center">
        {{ randomQuote }}
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
p.text-h6 {
  font-weight: normal;
}
</style>
