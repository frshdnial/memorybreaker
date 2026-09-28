<script setup>
import { computed } from 'vue'
import { useGame } from '../composables/useGame'

const { state, phaseSeconds, placeTile, removeSlot, clearSlots, checkAnswer } = useGame()
const pct = computed(() => Math.max(0, Math.round((state.timeLeft / phaseSeconds.value) * 100)))
const low = computed(() => state.timeLeft <= Math.ceil(phaseSeconds.value * 0.33))
</script>

<template>
  <div class="overlay" role="dialog" aria-modal="true" aria-label="Crack the code">
    <div class="panel">
      <p class="eyebrow">Stage {{ state.stage + 1 }} · crack the code</p>
      <h2>Unscramble the word</h2>
      <p class="desc">Tap the letters in the right order to form a tech word.</p>

      <div class="timer" :class="{ low }" :style="{ '--pct': pct }">
        <span class="timer-inner">{{ state.timeLeft }}</span>
      </div>

      <div class="slots-row">
        <button v-for="(s, i) in state.slots" :key="i" class="slot" :class="{ empty: !s, shake: state.shake }"
                :disabled="!s" @click="removeSlot(i)">{{ s ? s.letter : '' }}</button>
      </div>
      <div class="tiles-row">
        <button v-for="(t, i) in state.tiles" :key="i" class="tile" :class="{ used: t.used }"
                @click="placeTile(i)">{{ t.letter }}</button>
      </div>

      <div class="actions">
        <button class="btn btn-ghost" @click="clearSlots">Clear</button>
        <button class="btn btn-primary" @click="checkAnswer">Check</button>
      </div>
    </div>
  </div>
</template>
