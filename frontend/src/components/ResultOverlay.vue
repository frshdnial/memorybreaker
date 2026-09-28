<script setup>
import { ref, computed } from 'vue'
import Leaderboard from './Leaderboard.vue'
import Ghost from './Ghost.vue'
import { useGame } from '../composables/useGame'
import { submitScore } from '../api'
import { NAME_MAX, formatScore, formatTime } from '../config'

const { state, stageCount, nextStage, restart, backToMenu } = useGame()

const name = ref(localStorage.getItem('persaka-name') || '')
const busy = ref(false)
const error = ref('')
const saved = ref(null) // entry returned by the API

const isWin = computed(() => state.overlay === 'win')
const isLose = computed(() => state.overlay === 'lose')
const canSubmit = computed(() => state.totalScore > 0)

function cleanName() {
  name.value = name.value.toUpperCase().replace(/[^A-Z0-9 _.\-]/g, '').slice(0, NAME_MAX)
}

async function save() {
  cleanName()
  if (!name.value.trim()) { error.value = 'Enter your name first.'; return }
  busy.value = true
  error.value = ''
  try {
    saved.value = await submitScore({
      name: name.value.trim(),
      score: state.totalScore,
      timeMs: state.runMs,
      stagesCleared: state.stagesCleared
    })
    localStorage.setItem('persaka-name', name.value.trim())
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="overlay" role="dialog" aria-modal="true">
    <!-- STAGE CLEARED -->
    <div v-if="state.overlay === 'stageClear'" class="panel">
      <p class="badge">Stage cleared</p>
      <h2>Stage {{ state.stage + 1 }} cleared!</h2>
      <div class="win-word">{{ state.target }}</div>

      <dl class="breakdown" v-if="state.lastBreakdown">
        <div><dt>Clear bonus</dt><dd>+{{ state.lastBreakdown.clear }}</dd></div>
        <div><dt>Memory bonus</dt><dd>+{{ state.lastBreakdown.memory }}</dd></div>
        <div><dt>Speed bonus</dt><dd>+{{ state.lastBreakdown.speed }}</dd></div>
        <div class="sum"><dt>Score</dt><dd>{{ formatScore(state.totalScore) }}</dd></div>
      </dl>

      <p class="desc">Get ready for stage {{ state.stage + 2 }}: more cards, less time.</p>
      <div class="actions"><button class="btn btn-primary" @click="nextStage">Continue</button></div>
    </div>

    <!-- WIN / LOSE -->
    <div v-else class="panel wide">
      <template v-if="isWin">
        <p class="badge">All {{ stageCount }} stages cleared</p>
        <h2>Champion!</h2>
      </template>
      <template v-else>
        <p class="eyebrow lose">Time's up · stage {{ state.stage + 1 }}</p>
        <div class="ghost-line"><Ghost color="#ff2a2a" :size="30" /><h2>Game over</h2></div>
        <p class="desc">The code was <b class="lose-word">{{ state.target }}</b></p>
      </template>

      <dl class="result-stats">
        <div><dt>Score</dt><dd>{{ formatScore(state.totalScore) }}</dd></div>
        <div><dt>Time</dt><dd>{{ formatTime(state.runMs) }}</dd></div>
        <div><dt>Stages</dt><dd>{{ state.stagesCleared }}/{{ stageCount }}</dd></div>
      </dl>

      <!-- submit form -->
      <form v-if="canSubmit && !saved" class="submit" @submit.prevent="save">
        <label for="pname">Enter your name for the leaderboard</label>
        <div class="submit-row">
          <input id="pname" v-model="name" :maxlength="NAME_MAX" autocomplete="off" spellcheck="false"
                 placeholder="AAA" @input="cleanName" />
          <button class="btn btn-primary" :disabled="busy">{{ busy ? 'Saving...' : 'Save score' }}</button>
        </div>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </form>

      <p v-if="saved" class="rank-msg">
        Saved! You are rank <b>#{{ saved.rank }}</b>.
      </p>
      <p v-else-if="!canSubmit" class="desc">Clear a stage to earn a leaderboard score.</p>

      <Leaderboard v-if="saved" :key="saved.id" :highlight-id="saved.id" />

      <div class="actions">
        <button class="btn btn-primary" @click="restart">{{ isWin ? 'Play again' : 'Try again' }}</button>
        <button class="btn btn-ghost" @click="backToMenu">Menu</button>
      </div>
    </div>
  </div>
</template>
