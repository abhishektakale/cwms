import { useEffect, useState } from 'react'
import { CwmsLogo } from '../brand/CwmsLogo'
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
      aria-label="CWMS is working"
    >
      <div className="global-loader__panel">
        <CwmsLogo
          className="global-loader__mark"
          variant="color"
          showWordmark={false}
          width={56}
          height={60}
        />
        <div className="global-loader__copy">
          <div className="global-loader__brand">CWMS</div>
          <div className="global-loader__tagline">
            Plan · Manage · Build · Succeed
          </div>
          <div className="global-loader__status">Working…</div>
        </div>
        <div className="global-loader__bar" aria-hidden>
          <span className="global-loader__bar-fill" />
        </div>
      </div>
    </div>
  )
}
