import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { loadEntries, saveEntries, resetToSample, toDateKey, newId } from './storage.js'

const MILESTONES = [10, 25, 50, 100, 200, 500]
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function formatDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = toDateKey(new Date())
  const yesterday = toDateKey(new Date(Date.now() - 86400000))
  const label = `${m} 月 ${d} 日（週${WEEKDAYS[date.getDay()]}）`
  if (key === today) return `今天 · ${label}`
  if (key === yesterday) return `昨天 · ${label}`
  return `${y} 年 ${label}`
}

function celebrate() {
  const colors = ['#ff9f80', '#ffd166', '#8ecae6', '#b8e0a8', '#f7a8c4']
  const end = Date.now() + 1500
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors, scalar: 1.1 })
}

export default function App() {
  const [entries, setEntries] = useState(loadEntries)
  const [tab, setTab] = useState('timeline')
  const [milestone, setMilestone] = useState(null)

  useEffect(() => saveEntries(entries), [entries])

  const addEntry = (entry) => {
    const next = [...entries, { ...entry, id: newId(), createdAt: Date.now() }]
    setEntries(next)
    setTab('timeline')
    if (MILESTONES.includes(next.length)) {
      setMilestone(next.length)
      try {
        celebrate()
      } catch {
        // confetti is decorative; the milestone modal still shows
      }
    }
  }

  const deleteEntry = (id) => {
    if (confirm('確定要刪除這個字嗎？')) setEntries(entries.filter((e) => e.id !== id))
  }

  const nextMilestone = MILESTONES.find((m) => m > entries.length)

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-emoji" aria-hidden>👶</div>
        <div>
          <h1>寶寶字典</h1>
          <p className="subtitle">記錄寶寶說出的每一個第一次</p>
        </div>
        <div className="hero-count">
          <strong>{entries.length}</strong>
          <span>個字</span>
        </div>
      </header>

      {nextMilestone && (
        <div className="progress-card">
          <div className="progress-text">
            再 <b>{nextMilestone - entries.length}</b> 個字就達成 <b>{nextMilestone} 字</b> 里程碑 🎯
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, (entries.length / nextMilestone) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <nav className="tabs" role="tablist">
        {[
          ['timeline', '📖 時間軸'],
          ['add', '✏️ 新增'],
          ['stats', '📊 統計'],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? 'tab active' : 'tab'}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main>
        {tab === 'timeline' && <Timeline entries={entries} onDelete={deleteEntry} onAdd={() => setTab('add')} />}
        {tab === 'add' && <AddForm onSubmit={addEntry} />}
        {tab === 'stats' && <Stats entries={entries} onReset={() => setEntries(resetToSample())} />}
      </main>

      <button className="fab" onClick={() => setTab('add')} aria-label="新增一個字">＋</button>

      {milestone && <MilestoneModal count={milestone} onClose={() => setMilestone(null)} />}
    </div>
  )
}

function Timeline({ entries, onDelete, onAdd }) {
  const groups = useMemo(() => {
    const map = new Map()
    ;[...entries]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
      .forEach((e) => {
        if (!map.has(e.date)) map.set(e.date, [])
        map.get(e.date).push(e)
      })
    return [...map.entries()]
  }, [entries])

  if (groups.length === 0) {
    return (
      <div className="empty">
        <div className="empty-emoji">🌱</div>
        <p>還沒有紀錄，快來記下寶寶的第一個字吧！</p>
        <button className="btn-primary" onClick={onAdd}>新增第一個字</button>
      </div>
    )
  }

  return (
    <div className="timeline">
      {groups.map(([date, items]) => (
        <section key={date} className="day">
          <h2 className="day-title">
            <span className="dot" />
            {formatDate(date)}
            <span className="day-count">{items.length} 個</span>
          </h2>
          <div className="cards">
            {items.map((e) => (
              <article key={e.id} className="card">
                <div className="card-top">
                  <span className="word">{e.word}</span>
                  <button className="delete" onClick={() => onDelete(e.id)} aria-label="刪除">×</button>
                </div>
                {e.pronunciation && (
                  <div className="pron">🗣️ 寶寶說：「{e.pronunciation}」</div>
                )}
                {e.note && <p className="note">{e.note}</p>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function AddForm({ onSubmit }) {
  const [date, setDate] = useState(toDateKey(new Date()))
  const [word, setWord] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [note, setNote] = useState('')

  const submit = (ev) => {
    ev.preventDefault()
    if (!word.trim()) return
    onSubmit({ date, word: word.trim(), pronunciation: pronunciation.trim(), note: note.trim() })
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>
        <span>📅 日期</span>
        <input type="date" value={date} max={toDateKey(new Date())} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label>
        <span>💬 學會的字詞 <em>*</em></span>
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="例如：蘋果" maxLength={40} required autoFocus />
      </label>
      <label>
        <span>🗣️ 寶寶怎麼唸</span>
        <input value={pronunciation} onChange={(e) => setPronunciation(e.target.value)} placeholder="例如：蘋蘋、ㄆㄧㄥˊ ㄆㄧㄥˊ" maxLength={40} />
      </label>
      <label>
        <span>📝 情境小筆記</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="在哪裡、跟誰、為什麼說出這個字？" rows={3} maxLength={300} />
      </label>
      <button type="submit" className="btn-primary" disabled={!word.trim()}>
        記下來 ✨
      </button>
    </form>
  )
}

function Stats({ entries, onReset }) {
  const months = useMemo(() => {
    const map = new Map()
    entries.forEach((e) => {
      const key = e.date.slice(0, 7)
      map.set(key, (map.get(key) || 0) + 1)
    })
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [entries])

  const max = Math.max(1, ...months.map(([, c]) => c))
  const days = new Set(entries.map((e) => e.date)).size
  const thisMonth = toDateKey(new Date()).slice(0, 7)
  const reached = MILESTONES.filter((m) => m <= entries.length)

  return (
    <div className="stats">
      <div className="stat-grid">
        <div className="stat peach"><strong>{entries.length}</strong><span>總字數</span></div>
        <div className="stat sun"><strong>{months.find(([m]) => m === thisMonth)?.[1] || 0}</strong><span>本月新字</span></div>
        <div className="stat sky"><strong>{days}</strong><span>學習天數</span></div>
      </div>

      <div className="panel">
        <h3>每月新字數</h3>
        {months.length === 0 && <p className="muted">還沒有資料</p>}
        <div className="bars">
          {months.map(([m, c]) => {
            const [y, mo] = m.split('-')
            return (
              <div key={m} className="bar-row">
                <span className="bar-label">{y}/{Number(mo)} 月</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(c / max) * 100}%` }} />
                </div>
                <span className="bar-value">{c}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="panel">
        <h3>里程碑徽章</h3>
        <div className="badges">
          {MILESTONES.map((m) => (
            <div key={m} className={reached.includes(m) ? 'badge on' : 'badge'}>
              <span>{reached.includes(m) ? '🏅' : '🔒'}</span>
              <small>{m} 字</small>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-ghost" onClick={() => confirm('要清除目前資料並還原為範例資料嗎？') && onReset()}>
        還原範例資料
      </button>
    </div>
  )
}

function MilestoneModal({ count, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-emoji">🎉</div>
        <h2>太厲害了！</h2>
        <p>寶寶已經學會 <b>{count}</b> 個字囉！</p>
        <p className="muted">每一個字都是珍貴的成長紀錄 💛</p>
        <button className="btn-primary" onClick={onClose}>好開心！</button>
      </div>
    </div>
  )
}
