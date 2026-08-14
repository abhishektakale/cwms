import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CwmsLogo } from '../../shared/brand/CwmsLogo'
import './landing.css'

const PILLARS = [
  {
    title: 'Plan',
    text: 'Register works, track scopes, and keep every site decision in one system of record.',
  },
  {
    title: 'Manage',
    text: 'Run billing, expenditure, and documents with clear ownership across your team.',
  },
  {
    title: 'Build',
    text: 'Move from estimate to execution with progress you can trust on every project.',
  },
  {
    title: 'Succeed',
    text: 'Close works cleanly with audit-ready history and reporting that stands up to scrutiny.',
  },
] as const

export function LandingPage() {
  const { user, loading } = useAuth()
  const pillarsRef = useRef<HTMLElement>(null)
  const [pillarsVisible, setPillarsVisible] = useState(false)

  useEffect(() => {
    const node = pillarsRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPillarsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="landing">
      <section className="landing__hero" aria-label="CWMS">
        <div className="landing__hero-media" aria-hidden="true" />
        <div className="landing__hero-veil" aria-hidden="true" />
        <div className="landing__hero-grain" aria-hidden="true" />

        <div className="landing__hero-content">
          <CwmsLogo
            className="landing__logo"
            variant="reverse"
            layout="stacked"
            width={240}
            height={300}
          />
          <p className="landing__lede">
            Construction work management built for clarity from first estimate to
            final close-out.
          </p>
          <div className="landing__cta">
            <Link className="landing__btn landing__btn--primary" to="/login">
              Log in
            </Link>
            <a className="landing__btn landing__btn--ghost" href="#capabilities">
              See how it works
            </a>
          </div>
        </div>

        <a className="landing__scroll" href="#capabilities" aria-label="Scroll to capabilities">
          <span className="landing__scroll-line" aria-hidden="true" />
        </a>
      </section>

      <section
        id="capabilities"
        className={`landing__pillars${pillarsVisible ? ' landing__pillars--visible' : ''}`}
        ref={pillarsRef}
        aria-labelledby="landing-pillars-title"
      >
        <div className="landing__pillars-inner">
          <CwmsLogo
            className="landing__pillars-mark"
            variant="color"
            layout="mark"
            width={56}
            height={60}
            aria-hidden
          />
          <h2 id="landing-pillars-title" className="landing__pillars-title">
            Plan · Manage · Build · Succeed
          </h2>
          <p className="landing__pillars-sub">
            One operating rhythm for construction teams who need control without
            clutter.
          </p>
          <ul className="landing__pillar-list">
            {PILLARS.map((pillar, index) => (
              <li
                key={pillar.title}
                className="landing__pillar"
                style={{ '--pillar-i': index } as CSSProperties}
              >
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </li>
            ))}
          </ul>
          <Link
            className="landing__btn landing__btn--primary landing__pillars-cta"
            to="/login"
          >
            Enter CWMS
          </Link>
        </div>
      </section>

      <footer className="landing__footer">
        <CwmsLogo
          className="landing__footer-logo"
          variant="reverse"
          layout="horizontal"
          width={280}
          height={108}
        />
        <p className="landing__footer-tag">
          Plan <span aria-hidden="true">•</span> Manage{' '}
          <span aria-hidden="true">•</span> Build <span aria-hidden="true">•</span>{' '}
          Succeed
        </p>
      </footer>
    </div>
  )
}
