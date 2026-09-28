<script setup>
import { ref } from 'vue'
import StartScreen from './components/StartScreen.vue'
import GameScreen from './components/GameScreen.vue'
import CodeOverlay from './components/CodeOverlay.vue'
import ResultOverlay from './components/ResultOverlay.vue'
import LeaderboardModal from './components/LeaderboardModal.vue'
import { useGame } from './composables/useGame'

const { state, start } = useGame()
const showBoard = ref(false)
</script>

<template>
  <main class="stage-wrap">
    <StartScreen v-if="state.screen === 'start'" @start="start" @leaderboard="showBoard = true" />
    <GameScreen v-else @leaderboard="showBoard = true" />
    <footer class="credit">© PERSAKA 26/27 · INSERT COIN · 1 PLAYER</footer>
  </main>

  <CodeOverlay v-if="state.overlay === 'code'" />
  <ResultOverlay v-if="['stageClear', 'win', 'lose'].includes(state.overlay)" :key="state.overlay + state.stage" />
  <LeaderboardModal v-if="showBoard" @close="showBoard = false" />
</template>
