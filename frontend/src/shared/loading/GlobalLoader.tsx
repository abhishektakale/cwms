import { useEffect, useState } from 'react'
import { subscribeRequests } from './requestTracker'
import './global-loader.css'

const SHOW_DELAY_MS = 120

export function GlobalLoader() {
  const [inflight, setInflight] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => subscribeRequests(setInflight), [])

  useEffect(() => {
    if (inflight <= 0) {
      setVisible(false)
      return
    }
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [inflight])

  if (!visible) return null

  return (
    <div
      className="global-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="global-loader__panel">
        <span className="global-loader__spinner" aria-hidden />
        <span className="global-loader__label">Working…</span>
      </div>
    </div>
  )
}
