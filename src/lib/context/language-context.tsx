'use client'
import * as React from 'react'
import type { LangCode, Translations } from '@/lib/i18n/translations'
import { translations, LANGUAGES } from '@/lib/i18n/translations'

/**
 * Genera la clave de localStorage para el idioma de un usuario específico.
 * Si no hay userId, usa la clave global como fallback.
 */
export function getLangKey(userId?: string | null): string {
  return userId ? `u_${userId}_lang` : 'conectar_lang'
}

interface LanguageContextValue {
  lang: LangCode
  setLang: (l: LangCode) => void
  setUserId: (id: string | null) => void
  t: typeof translations['es']
}

const LanguageContext = React.createContext<LanguageContextValue>({
  lang: 'es',
  setLang: () => {},
  setUserId: () => {},
  t: translations['es'],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<LangCode>('es')
  const [userId, setUserIdState] = React.useState<string | null>(null)

  // Carga el idioma guardado cuando cambia el userId
  React.useEffect(() => {
    try {
      const key = getLangKey(userId)
      const saved = localStorage.getItem(key)
      if (saved && (translations as Record<string, Translations>)[saved]) {
        setLangState(saved as LangCode)
      } else if (userId) {
        // Usuario autenticado sin preferencia guardada:
        // intentar migrar desde la clave global legacy
        const legacy = localStorage.getItem('conectar_lang')
        if (legacy && (translations as Record<string, Translations>)[legacy]) {
          setLangState(legacy as LangCode)
          localStorage.setItem(key, legacy)
        }
      }
    } catch {
      // noop
    }
  }, [userId])

  function setUserId(id: string | null) {
    setUserIdState(id)
  }

  function setLang(l: LangCode) {
    setLangState(l)
    try {
      const key = getLangKey(userId)
      localStorage.setItem(key, l)
    } catch {
      // noop
    }
    // Aplicar RTL si es necesario
    const meta = LANGUAGES.find(x => x.code === l)
    document.documentElement.dir = meta?.dir === 'rtl' ? 'rtl' : 'ltr'
  }

  const t = translations[lang] ?? translations['es']
  return (
    <LanguageContext.Provider value={{ lang, setLang, setUserId, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return React.useContext(LanguageContext)
}
