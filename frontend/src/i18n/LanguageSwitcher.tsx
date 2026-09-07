import { useTranslation } from 'react-i18next'
import './language-switcher.css'

export function LanguageSwitcher({
  variant = 'default',
}: {
  variant?: 'default' | 'onDark'
}) {
  const { i18n, t } = useTranslation()
  const current = i18n.language.startsWith('mr') ? 'mr' : 'en'

  return (
    <div
      className={`lang-switch lang-switch--${variant}`}
      role="group"
      aria-label={t('lang.label')}
    >
      <button
        type="button"
        className="lang-switch__btn"
        aria-pressed={current === 'en'}
        onClick={() => void i18n.changeLanguage('en')}
      >
        EN
      </button>
      <button
        type="button"
        className="lang-switch__btn"
        aria-pressed={current === 'mr'}
        onClick={() => void i18n.changeLanguage('mr')}
      >
        मराठी
      </button>
    </div>
  )
}
