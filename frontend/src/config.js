// ---------- data pools (unchanged from the original game) ----------
export const TECH_POOL = [
  { id: 'python', label: 'PYTHON', icon: '🐍' },
  { id: 'java', label: 'JAVA', icon: '☕' },
  { id: 'javascript', label: 'JAVASCRIPT', icon: '⚡' },
  { id: 'react', label: 'REACT', icon: '⚛' },
  { id: 'html', label: 'HTML', icon: '</>' },
  { id: 'css', label: 'CSS', icon: '#' },
  { id: 'git', label: 'GIT', icon: '⑂' },
  { id: 'sql', label: 'SQL', icon: '🗄' },
  { id: 'linux', label: 'LINUX', icon: '🐧' },
  { id: 'docker', label: 'DOCKER', icon: '🐳' }
]

export const WORDS_BY_LEN = {
  5: ['CACHE', 'ARRAY', 'STACK', 'QUEUE', 'CLASS', 'DEBUG', 'INPUT', 'LOGIC', 'BYTES', 'TOKEN'],
  6: ['STRING', 'OBJECT', 'METHOD', 'MODULE', 'SERVER', 'SCRIPT', 'BINARY', 'THREAD'],
  7: ['RUNTIME', 'COMPILE', 'ROUTINE', 'PACKAGE', 'CLUSTER', 'GATEWAY']
}

// 5 stages: more pairs, longer words, less time
export const STAGES = [
  { pairs: 3, wordLen: 5, time: 40 },
  { pairs: 4, wordLen: 5, time: 35 },
  { pairs: 4, wordLen: 6, time: 30 },
  { pairs: 5, wordLen: 6, time: 25 },
  { pairs: 5, wordLen: 7, time: 20 }
]

export const NAME_MAX = 12

// ---------- scoring ----------
// Per cleared stage:
//   clear bonus   1000 x stage number
//   memory bonus  150 per pair, minus 25 per wasted move (never below 0)
//   speed bonus   25 per second left on the code-breaking timer
// The theoretical maximum for all 5 stages is ~22,500 (API accepts up to 30,000).
export function stageScore({ stage, pairs, moves, timeLeft }) {
  const clear = 1000 * stage
  const memory = Math.max(0, pairs * 150 - Math.max(0, moves - pairs) * 25)
  const speed = timeLeft * 25
  return { clear, memory, speed, total: clear + memory + speed }
}

export function formatTime(ms) {
  const total = Math.max(0, Math.round(ms / 100)) // tenths
  const m = Math.floor(total / 600)
  const s = Math.floor((total % 600) / 10)
  const t = total % 10
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${t}`
}

export function formatScore(n) {
  return String(n).padStart(6, '0')
}
