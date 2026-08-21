import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'
import { CwmsLogo } from '../../shared/brand/CwmsLogo'
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher'
import './landing.css'

const PILLARS = ['plan', 'manage', 'build', 'succeed'] as const

export function LandingPage() {
  const { t } = useTranslation()
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

        <div className="landing__lang">
          <LanguageSwitcher variant="onDark" />
        </div>

        <div className="landing__hero-content">
          <CwmsLogo
            className="landing__logo"
            variant="reverse"
            layout="stacked"
            width={240}
            height={300}
          />
          <p className="landing__lede">{t('landing.lede')}</p>
          <div className="landing__cta">
            <Link className="landing__btn landing__btn--primary" to="/login">
              {t('landing.logIn')}
            </Link>
            <a className="landing__btn landing__btn--ghost" href="#capabilities">
              {t('landing.seeHow')}
            </a>
          </div>
        </div>

        <a className="landing__scroll" href="#capabilities" aria-label={t('landing.scrollAria')}>
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
            {t('brand.tagline')}
          </h2>
          <p className="landing__pillars-sub">{t('landing.taglineSub')}</p>
          <ul className="landing__pillar-list">
            {PILLARS.map((pillar, index) => (
              <li
                key={pillar}
                className="landing__pillar"
                style={{ '--pillar-i': index } as CSSProperties}
              >
                <h3>{t(`landing.pillars.${pillar}.title`)}</h3>
                <p>{t(`landing.pillars.${pillar}.text`)}</p>
              </li>
            ))}
          </ul>
          <Link
            className="landing__btn landing__btn--primary landing__pillars-cta"
            to="/login"
          >
            {t('landing.enter')}
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
        <p className="landing__footer-tag">{t('brand.tagline')}</p>
      </footer>
    </div>
  )
}
