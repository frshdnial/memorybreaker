const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(BASE + path, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      ...options
    })
  } catch {
    throw new Error('Cannot reach the leaderboard server.')
  }

  let payload = null
  try { payload = await res.json() } catch { /* non-JSON body */ }

  if (!res.ok) {
    const fieldMsg = payload?.fields ? Object.values(payload.fields)[0] : null
    throw new Error(fieldMsg || payload?.error || `Server error (${res.status}).`)
  }
  return payload
}

export async function fetchLeaderboard(limit = 10) {
  const payload = await request(`/leaderboard?limit=${limit}`)
  return payload.data
}

export async function submitScore({ name, score, timeMs, stagesCleared }) {
  const payload = await request('/scores', {
    method: 'POST',
    body: JSON.stringify({
      name,
      score,
      time_ms: timeMs,
      stages_cleared: stagesCleared
    })
  })
  return payload.data
}
