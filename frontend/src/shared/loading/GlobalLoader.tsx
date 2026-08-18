import { useEffect, useRef, useState } from 'react'
import { LoaderMark } from './LoaderMark'
import { LOADER_CYCLE_MS, LOADER_HIDE_TAIL_MS } from './loader-cycle'
import { subscribeRequests } from './requestTracker'
import './global-loader.css'

const SHOW_DELAY_MS = 120

/** Branded overlay markup — used by request tracking and route Suspense. */
export function GlobalLoaderFallback() {
  return (
    <div
      className="global-loader"
      style={{ ['--loader-cycle' as string]: `${LOADER_CYCLE_MS}ms` }}
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

function hideDelayMs(startedAt: number) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return 0
  const elapsed = (performance.now() - startedAt) % LOADER_CYCLE_MS
  const remainingInCycle = elapsed === 0 ? 0 : LOADER_CYCLE_MS - elapsed
  return Math.min(remainingInCycle, LOADER_HIDE_TAIL_MS)
}

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
    const timer = window.setTimeout(() => {
      cycleStartedAt.current = null
      setVisible(false)
    }, hideDelayMs(started))
    return () => window.clearTimeout(timer)
  }, [inflight, visible])

  if (!visible) return null

  return <GlobalLoaderFallback />
}
