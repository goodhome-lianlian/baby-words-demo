import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function showFallback(error) {
  const fallback = document.getElementById('fallback')
  if (!fallback) return
  fallback.style.display = ''
  const detail = document.getElementById('fallback-error')
  if (detail && error) {
    detail.textContent = `錯誤訊息：${error && error.message ? error.message : String(error)}`
    detail.style.display = ''
  }
}

function Mounted({ children }) {
  useEffect(() => {
    const fallback = document.getElementById('fallback')
    if (fallback) fallback.style.display = 'none'
  }, [])
  return children
}

try {
  createRoot(document.getElementById('root'), {
    onUncaughtError: (error) => showFallback(error),
  }).render(
    <StrictMode>
      <Mounted>
        <App />
      </Mounted>
    </StrictMode>,
  )
} catch (error) {
  showFallback(error)
}
