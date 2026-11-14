const STORAGE_KEY = 'baby-words:v1'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toDateKey(d)
}

export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function seedEntries() {
  const seed = [
    [52, '媽媽', 'ㄇㄚ ㄇㄚ', '早上喝完奶，看著我突然叫出來，全家都哭了 🥹'],
    [48, '爸爸', '把把', '爸爸下班進門時說的'],
    [40, '抱抱', '抱～抱～', '伸出雙手要人抱'],
    [33, '奶奶', 'ㄋㄟ ㄋㄟ', '肚子餓時指著奶瓶'],
    [33, '狗狗', '狗狗！', '在公園看到柴犬'],
    [21, '不要', '不～要', '第一次拒絕吃紅蘿蔔 😂'],
    [14, '謝謝', '謝謝', '拿到餅乾時阿嬤教她說的'],
    [6, '球球', '囚囚', '在客廳追著紅色的球'],
    [2, '再見', '掰掰', '跟送貨叔叔揮手'],
  ]
  return seed.map(([ago, word, pronunciation, note], i) => ({
    id: `seed-${i}`,
    date: daysAgo(ago),
    word,
    pronunciation,
    note,
    createdAt: Date.now() - ago * 86400000,
  }))
}

// Private browsing, file:// viewers and in-app webviews may block or throw on localStorage.
const memoryStore = {}

function readRaw() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return memoryStore[STORAGE_KEY] ?? null
  }
}

function writeRaw(value) {
  memoryStore[STORAGE_KEY] = value
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // keep the in-memory copy only
  }
}

export function newId() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID()
  } catch {
    // randomUUID is unavailable outside secure contexts
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function loadEntries() {
  try {
    const raw = readRaw()
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // corrupted storage falls through to seed data
  }
  const seeded = seedEntries()
  saveEntries(seeded)
  return seeded
}

export function saveEntries(entries) {
  writeRaw(JSON.stringify(entries))
}

export function resetToSample() {
  const seeded = seedEntries()
  saveEntries(seeded)
  return seeded
}
