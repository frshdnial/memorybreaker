<script setup>
import Ghost from './Ghost.vue'
import PacMan from './PacMan.vue'
</script>

<template>
  <div class="chase" aria-hidden="true">
    <div class="chase-dots"></div>
    <div class="chase-run">
      <Ghost color="#ff2a2a" :size="26" />
      <Ghost color="#ffb8ff" :size="26" />
      <Ghost color="#00ffff" :size="26" />
      <Ghost color="#ffb852" :size="26" />
      <PacMan :size="26" />
    </div>
  </div>
</template>
