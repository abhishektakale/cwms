import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import mr from './locales/mr.json'

export const LANG_STORAGE_KEY = 'cwms.lang'
export const SUPPORTED_LANGS = ['en', 'mr'] as const
export type AppLanguage = (typeof SUPPORTED_LANGS)[number]

function readStoredLang(): AppLanguage {
  try {
    const value = localStorage.getItem(LANG_STORAGE_KEY)
    if (value === 'mr' || value === 'en') return value
  } catch {
    /* ignore */
  }
  return 'en'
}

export function applyDocumentLang(lang: string) {
  const resolved: AppLanguage = lang.startsWith('mr') ? 'mr' : 'en'
  document.documentElement.lang = resolved
  try {
    localStorage.setItem(LANG_STORAGE_KEY, resolved)
  } catch {
    /* ignore */
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    mr: { translation: mr },
  },
  lng: readStoredLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

applyDocumentLang(i18n.language)
i18n.on('languageChanged', applyDocumentLang)

export default i18n
