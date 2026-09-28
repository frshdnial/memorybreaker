<script setup>
import PacMan from './PacMan.vue'
import { useGame } from '../composables/useGame'
import { formatScore } from '../config'
import { muted, toggleMute } from '../sfx'

defineEmits(['leaderboard'])
const { state, totalPairs, stageCount, flipCard, backToMenu } = useGame()
</script>

<template>
  <section class="cabinet game">
    <header class="hud">
      <div class="hud-brand">
        <span class="logo-badge sm"><img src="/persaka-logo.png" alt="PERSAKA" /></span>
        <span class="hud-title">CODEBREAKER</span>
      </div>

      <div class="hud-cell">
        <span class="hud-label">1UP</span>
        <span class="hud-value">{{ formatScore(state.totalScore) }}</span>
      </div>

      <div class="hud-cell">
        <span class="hud-label">Stage</span>
        <span class="pellets" :aria-label="`Stage ${state.stage + 1} of ${stageCount}`">
          <i v-for="n in stageCount" :key="n"
             :class="{ done: n - 1 < state.stage, current: n - 1 === state.stage }">
            <PacMan v-if="n - 1 === state.stage" :size="14" />
          </i>
        </span>
      </div>

      <div class="hud-cell">
        <span class="hud-label">Matches</span>
        <span class="hud-value">{{ state.matched }}/{{ totalPairs }}</span>
      </div>
      <div class="hud-cell">
        <span class="hud-label">Moves</span>
        <span class="hud-value">{{ state.moves }}</span>
      </div>

      <div class="hud-tools">
        <button class="icon-btn" :aria-label="muted ? 'Unmute' : 'Mute'" @click="toggleMute">{{ muted ? '🔇' : '🔊' }}</button>
        <button class="icon-btn" aria-label="High scores" @click="$emit('leaderboard')">🏆</button>
        <button class="icon-btn" aria-label="Quit to menu" @click="backToMenu">✕</button>
      </div>
    </header>

    <div class="board">
      <button
        v-for="c in state.cards" :key="c.index"
        class="card"
        :class="{ flipped: c.flipped, matched: c.matched }"
        :aria-label="c.flipped || c.matched ? c.label : 'Hidden card'"
        @click="flipCard(c.index)"
      >
        <span class="card-inner">
          <span class="face back"><i class="pellet"></i></span>
          <span class="face front">
            <span class="icon">{{ c.icon }}</span>
            <span class="label">{{ c.label }}</span>
          </span>
        </span>
      </button>
    </div>

    <footer class="tray-wrap">
      <span class="tray-label">Letters</span>
      <div class="tray">
        <span v-for="i in state.target.length" :key="i" class="tray-slot" :class="{ filled: state.collected[i - 1] }">
          {{ state.collected[i - 1] || '' }}
        </span>
      </div>
    </footer>
  </section>
</template>
