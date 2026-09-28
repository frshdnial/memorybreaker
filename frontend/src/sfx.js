import { ref } from 'vue'

// Tiny WebAudio "chiptune" effects, no audio files needed.
export const muted = ref(localStorage.getItem('persaka-muted') === '1')
let ctx = null

export function toggleMute() {
  muted.value = !muted.value
  localStorage.setItem('persaka-muted', muted.value ? '1' : '0')
}

function beep(freq, dur = 0.08, type = 'square', delay = 0, vol = 0.04) {
  if (muted.value) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const t0 = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    gain.gain.setValueAtTime(vol, t0)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur)
  } catch { /* audio unavailable */ }
}

export const sfx = {
  flip: () => beep(520, 0.05),
  miss: () => beep(160, 0.16, 'sawtooth'),
  // the classic "waka waka"
  match: () => { beep(330, 0.07); beep(494, 0.07, 'square', 0.08); beep(330, 0.07, 'square', 0.16); beep(659, 0.09, 'square', 0.24) },
  tile: () => beep(700, 0.04),
  clear: () => [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.12, 'square', i * 0.1)),
  fail: () => [494, 466, 440, 415, 392, 370, 349, 330].forEach((f, i) => beep(f, 0.09, 'triangle', i * 0.07, 0.06)),
  start: () => [262, 262, 523, 392, 330, 262].forEach((f, i) => beep(f, 0.1, 'square', i * 0.09))
}
