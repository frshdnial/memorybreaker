import { reactive, computed } from 'vue'
import { TECH_POOL, WORDS_BY_LEN, STAGES, stageScore } from '../config'
import { sfx } from '../sfx'

// Module-level singleton store: every component shares the same game.
const state = reactive({
  screen: 'start',          // 'start' | 'game'
  overlay: null,            // null | 'code' | 'stageClear' | 'win' | 'lose'
  stage: 0,                 // 0-indexed
  target: '',
  pairsData: [],
  cards: [],
  flipped: [],
  matched: 0,
  moves: 0,
  locked: false,
  collected: [],
  // code-breaking phase
  tiles: [],
  slots: [],
  timeLeft: 0,
  shake: false,
  // run tracking
  totalScore: 0,
  stagesCleared: 0,
  runMs: 0,                 // active play time (excludes the "stage cleared" pauses)
  lastBreakdown: null
})

let timerHandle = null
let stageStartedAt = 0

const cfg = () => STAGES[state.stage]
const totalPairs = computed(() => cfg().pairs)
const phaseSeconds = computed(() => cfg().time)

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const pick = (arr, n) => shuffle(arr).slice(0, n)

function stopTimer() {
  if (timerHandle) clearInterval(timerHandle)
  timerHandle = null
}

function endStageClock() {
  state.runMs += Math.round(performance.now() - stageStartedAt)
}

function setupStage() {
  const c = cfg()
  state.target = pick(WORDS_BY_LEN[c.wordLen], 1)[0]

  const chosen = pick(TECH_POOL, c.pairs)
  state.pairsData = chosen.map(t => ({ pairId: t.id, letters: [] }))
  for (let i = 0; i < state.target.length; i++) {
    state.pairsData[i % c.pairs].letters.push(state.target[i])
  }

  const deck = []
  chosen.forEach(t => {
    deck.push({ pairId: t.id, icon: t.icon, label: t.label, face: 'icon' })
    deck.push({ pairId: t.id, icon: t.icon, label: t.label, face: 'word' })
  })
  state.cards = shuffle(deck).map((c, i) => ({ ...c, index: i, flipped: false, matched: false }))

  state.flipped = []
  state.matched = 0
  state.moves = 0
  state.locked = false
  state.collected = []
  state.overlay = null
  stageStartedAt = performance.now()
}

function resetRun() {
  stopTimer()
  state.stage = 0
  state.totalScore = 0
  state.stagesCleared = 0
  state.runMs = 0
  state.lastBreakdown = null
}

function start() {
  resetRun()
  state.screen = 'game'
  setupStage()
  sfx.start()
}

function restart() {
  resetRun()
  setupStage()
  sfx.start()
}

function backToMenu() {
  resetRun()
  state.overlay = null
  state.screen = 'start'
}

function nextStage() {
  state.stage++
  setupStage()
}

// ---------- phase 1: memory ----------
function flipCard(index) {
  if (state.locked || state.overlay) return
  const c = state.cards[index]
  if (c.flipped || c.matched || state.flipped.length === 2) return

  c.flipped = true
  state.flipped.push(index)
  sfx.flip()

  if (state.flipped.length < 2) return

  state.moves++
  state.locked = true
  const [i1, i2] = state.flipped
  const c1 = state.cards[i1]
  const c2 = state.cards[i2]

  if (c1.pairId === c2.pairId) {
    setTimeout(() => {
      c1.matched = c2.matched = true
      state.matched++
      const pair = state.pairsData.find(p => p.pairId === c1.pairId)
      state.collected = state.collected.concat(pair.letters)
      state.flipped = []
      state.locked = false
      sfx.match()
      if (state.matched === totalPairs.value) setTimeout(startCodePhase, 600)
    }, 500)
  } else {
    setTimeout(() => {
      c1.flipped = c2.flipped = false
      state.flipped = []
      state.locked = false
      sfx.miss()
    }, 850)
  }
}

// ---------- phase 2: unscramble ----------
function startCodePhase() {
  state.tiles = shuffle(state.collected).map(letter => ({ letter, used: false }))
  state.slots = new Array(state.target.length).fill(null)
  state.timeLeft = phaseSeconds.value
  state.overlay = 'code'
  stopTimer()
  timerHandle = setInterval(() => {
    state.timeLeft--
    if (state.timeLeft <= 0) {
      state.timeLeft = 0
      stopTimer()
      onFailed()
    }
  }, 1000)
}

function placeTile(i) {
  if (state.overlay !== 'code' || state.tiles[i].used) return
  const empty = state.slots.findIndex(s => s === null)
  if (empty === -1) return
  state.slots[empty] = { letter: state.tiles[i].letter, tileIndex: i }
  state.tiles[i].used = true
  sfx.tile()
  if (state.slots.every(s => s !== null)) setTimeout(checkAnswer, 350)
}

function removeSlot(i) {
  const s = state.slots[i]
  if (!s) return
  state.tiles[s.tileIndex].used = false
  state.slots[i] = null
}

function clearSlots() {
  state.slots.forEach(s => { if (s) state.tiles[s.tileIndex].used = false })
  state.slots = new Array(state.target.length).fill(null)
}

function checkAnswer() {
  if (state.overlay !== 'code' || state.slots.some(s => s === null)) return
  const attempt = state.slots.map(s => s.letter).join('')
  if (attempt === state.target) {
    stopTimer()
    onCleared()
  } else if (!state.shake) {
    state.shake = true
    sfx.miss()
    setTimeout(() => { state.shake = false; clearSlots() }, 400)
  }
}

function onCleared() {
  endStageClock()
  const c = cfg()
  const breakdown = stageScore({ stage: state.stage + 1, pairs: c.pairs, moves: state.moves, timeLeft: state.timeLeft })
  state.lastBreakdown = breakdown
  state.totalScore += breakdown.total
  state.stagesCleared++
  sfx.clear()
  state.overlay = state.stage === STAGES.length - 1 ? 'win' : 'stageClear'
}

function onFailed() {
  endStageClock()
  sfx.fail()
  state.overlay = 'lose'
}

export function useGame() {
  return {
    state,
    totalPairs,
    phaseSeconds,
    stageCount: STAGES.length,
    start, restart, backToMenu, nextStage,
    flipCard, placeTile, removeSlot, clearSlots, checkAnswer
  }
}
