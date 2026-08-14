import { useEffect, useRef, useState } from 'react'
import { LoaderMark } from './LoaderMark'
import { subscribeRequests } from './requestTracker'
import './global-loader.css'

const SHOW_DELAY_MS = 120
/** Keep in sync with `--loader-cycle` in global-loader.css */
const CYCLE_MS = 5800

export function GlobalLoader() {
  const [inflight, setInflight] = useState(0)
  const [visible, setVisible] = useState(false)
  const cycleStartedAt = useRef<number | null>(null)

  useEffect(() => subscribeRequests(setInflight), [])

  useEffect(() => {
    if (inflight > 0) {
      if (visible) return
      const timer = window.setTimeout(() => {
        cycleStartedAt.current = performance.now()
        setVisible(true)
      }, SHOW_DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    if (!visible) return

    const started = cycleStartedAt.current ?? performance.now()
    const elapsed = (performance.now() - started) % CYCLE_MS
    const remaining = elapsed === 0 ? 0 : CYCLE_MS - elapsed
    const timer = window.setTimeout(() => {
      cycleStartedAt.current = null
      setVisible(false)
    }, remaining)
    return () => window.clearTimeout(timer)
  }, [inflight, visible])

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
        <LoaderMark />
        <div className="global-loader__copy">
          <div className="global-loader__brand">
            CW<span>M</span>S
          </div>
          <div className="global-loader__tagline">
            Plan · Manage · Build · Succeed
          </div>
          <div className="global-loader__status">Building…</div>
        </div>
      </div>
    </div>
  )
}
