'use client'
import * as React from 'react'
import type { LangCode, Translations } from '@/lib/i18n/translations'
import { translations, LANGUAGES } from '@/lib/i18n/translations'

const STORAGE_KEY = 'conectar_lang'

interface LanguageContextValue {
  lang: LangCode
  setLang: (l: LangCode) => void
  t: typeof translations['es']
}

const LanguageContext = React.createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
  t: translations['es'],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<LangCode>('es')

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && (translations as Record<string, Translations>)[saved]) {
      setLangState(saved as LangCode)
    }
  }, [])

  function setLang(l: LangCode) {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
    // Apply RTL if needed
    const meta = LANGUAGES.find(x => x.code === l)
    document.documentElement.dir = meta?.dir === 'rtl' ? 'rtl' : 'ltr'
  }

  const t = translations[lang] ?? translations['es']
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return React.useContext(LanguageContext)
}
