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

export function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted storage falls through to seed data
  }
  const seeded = seedEntries()
  saveEntries(seeded)
  return seeded
}

export function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function resetToSample() {
  const seeded = seedEntries()
  saveEntries(seeded)
  return seeded
}
