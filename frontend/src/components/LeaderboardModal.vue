<script setup>
import Leaderboard from './Leaderboard.vue'
defineEmits(['close'])
</script>

<template>
  <div class="overlay" role="dialog" aria-modal="true" aria-label="High scores" @click.self="$emit('close')">
    <div class="panel wide">
      <p class="eyebrow">Top 10</p>
      <h2>High scores</h2>
      <p class="desc">Ranked by score. Ties go to the faster time.</p>
      <Leaderboard :limit="10" />
      <div class="actions"><button class="btn btn-primary" @click="$emit('close')">Close</button></div>
    </div>
  </div>
</template>
