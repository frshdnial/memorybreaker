<script setup>
import { ref } from 'vue'
import ChaseStrip from './ChaseStrip.vue'
import Ghost from './Ghost.vue'
import { STAGES, NAME_MAX } from '../config'

const emit = defineEmits(['start', 'leaderboard'])

const name = ref(localStorage.getItem('persaka-name') || '')
const error = ref('')

function cleanName() {
  name.value = name.value.toUpperCase().replace(/[^A-Z0-9 _.\-]/g, '').slice(0, NAME_MAX)
}

function handleStart() {
  cleanName()
  if (!name.value.trim()) {
    error.value = 'Enter your name to start.'
    return
  }
  error.value = ''
  emit('start', name.value.trim())
}
</script>

<template>
  <section class="cabinet start">
    <div class="marquee">
      <div class="logo-badge"><img src="/persaka-logo.png" alt="PERSAKA logo" /></div>
      <div class="marquee-text">
        <p class="club">PERSAKA 26/27</p>
        <p class="club-sub">UTM Faculty of Computing</p>
      </div>
    </div>

    <h1 class="title">
      <span class="t1">MEMORY</span>
      <span class="t2">CODEBREAKER</span>
    </h1>

    <ChaseStrip />

    <p class="lead">
      Match tech cards, eat the secret letters, and crack the code across 5 stages.
    </p>

    <ol class="how">
      <li><Ghost color="#ff2a2a" :size="22" /><span>Flip <b>two cards</b> to find the matching tech logo and name.</span></li>
      <li><Ghost color="#ffb8ff" :size="22" /><span>Every match <b>drops secret letters</b> into your tray.</span></li>
      <li><Ghost color="#00ffff" :size="22" /><span>Unscramble them into <b>one tech word</b> before the timer runs out.</span></li>
      <li><Ghost color="#ffb852" :size="22" /><span>Score points for speed and few moves. <b>Climb the leaderboard.</b></span></li>
    </ol>

    <div class="stage-preview">
      <div v-for="(s, i) in STAGES" :key="i" class="sp">
        <span class="sp-n">S{{ i + 1 }}</span>
        <span>{{ s.pairs }} pairs</span>
        <span>{{ s.wordLen }} letters</span>
        <span>{{ s.time }}s</span>
      </div>
    </div>

    <form class="submit name-entry" @submit.prevent="handleStart">
      <label for="pname">Enter your name to play</label>
      <div class="submit-row">
        <input id="pname" v-model="name" :maxlength="NAME_MAX" autocomplete="off" spellcheck="false"
               placeholder="AAA" @input="cleanName" />
      </div>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    </form>

    <div class="actions">
      <button class="btn btn-primary blink-soft" @click="handleStart">Start game</button>
      <button class="btn btn-ghost" @click="$emit('leaderboard')">High scores</button>
    </div>
  </section>
</template>
