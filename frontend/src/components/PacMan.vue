<script setup>
defineProps({ size: { type: Number, default: 30 } })
</script>

<template>
  <span class="pacman" :style="{ '--s': size + 'px' }" aria-hidden="true"></span>
</template>
