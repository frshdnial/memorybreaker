<script setup>
defineProps({
  color: { type: String, default: '#ff2a2a' },
  scared: { type: Boolean, default: false },
  size: { type: Number, default: 28 }
})
</script>

<template>
  <svg class="ghost" :width="size" :height="size" viewBox="0 0 14 14" shape-rendering="crispEdges" aria-hidden="true">
    <path
      :fill="scared ? '#2121de' : color"
      d="M2 14V6a5 5 0 0 1 10 0v8l-1.67-2L8.67 14 7 12l-1.67 2L3.67 12z"
    />
    <template v-if="scared">
      <rect x="4" y="5" width="2" height="2" fill="#ffd6c9" />
      <rect x="8" y="5" width="2" height="2" fill="#ffd6c9" />
      <path d="M3 10h1v-1h1v1h1v-1h1v1h1v-1h1v1h1" stroke="#ffd6c9" stroke-width=".8" fill="none" />
    </template>
    <template v-else>
      <rect x="3.5" y="4.5" width="3" height="3.5" rx="1.4" fill="#fff" />
      <rect x="7.5" y="4.5" width="3" height="3.5" rx="1.4" fill="#fff" />
      <rect x="5" y="6" width="1.5" height="1.8" fill="#2121de" />
      <rect x="9" y="6" width="1.5" height="1.8" fill="#2121de" />
    </template>
  </svg>
</template>
