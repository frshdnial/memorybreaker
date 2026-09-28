<script setup>
import { ref, onMounted } from 'vue'
import { fetchLeaderboard } from '../api'
import { formatScore, formatTime } from '../config'

const props = defineProps({
  highlightId: { type: Number, default: null },
  limit: { type: Number, default: 10 }
})

const rows = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await fetchLeaderboard(props.limit)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
onMounted(load)
defineExpose({ reload: load })

const medal = rank => (rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '')
</script>

<template>
  <div class="lb">
    <p v-if="loading" class="lb-note blink">LOADING...</p>

    <div v-else-if="error" class="lb-note lb-error">
      <p>{{ error }}</p>
      <button class="btn btn-ghost btn-sm" @click="load">Retry</button>
    </div>

    <p v-else-if="!rows.length" class="lb-note">No scores yet. Be the first to clear the maze.</p>

    <div v-else class="lb-scroll">
      <table class="lb-table">
        <thead>
          <tr><th>#</th><th class="l">Player</th><th>Score</th><th>Time</th><th>Stg</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" :class="[medal(r.rank), { me: r.id === highlightId }]">
            <td>{{ r.rank }}</td>
            <td class="l name">{{ r.player_name }}</td>
            <td>{{ formatScore(r.score) }}</td>
            <td>{{ formatTime(r.time_ms) }}</td>
            <td>{{ r.stages_cleared }}/5</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
