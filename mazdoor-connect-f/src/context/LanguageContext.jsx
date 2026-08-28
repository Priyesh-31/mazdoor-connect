import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations, translateCategory } from '../i18n.js'

const LanguageContext = createContext(null)

function createFallbackLanguageValue() {
  const language = localStorage.getItem('mc_lang') || 'en'
  const dict = translations[language] || translations.en

  return {
    language,
    setLanguage: (nextLanguage) => {
      const resolved = typeof nextLanguage === 'function' ? nextLanguage(language) : nextLanguage
      localStorage.setItem('mc_lang', resolved)
      document.documentElement.lang = resolved === 'hi' ? 'hi' : 'en'
      document.documentElement.dir = 'ltr'
      window.location.reload()
    },
    toggleLanguage: () => {
      const nextLanguage = language === 'en' ? 'hi' : 'en'
      localStorage.setItem('mc_lang', nextLanguage)
      document.documentElement.lang = nextLanguage === 'hi' ? 'hi' : 'en'
      document.documentElement.dir = 'ltr'
      window.location.reload()
    },
    t: (key) => dict[key] || translations.en[key] || key,
    translateCategory: (label) => translateCategory(label, language),
    isHindi: language === 'hi',
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('mc_lang') || 'en')

  useEffect(() => {
    localStorage.setItem('mc_lang', language)
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en'
    document.documentElement.dir = 'ltr'
  }, [language])

  const value = useMemo(() => {
    const dict = translations[language] || translations.en
    return {
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(current => (current === 'en' ? 'hi' : 'en')),
      t: (key) => dict[key] || translations.en[key] || key,
      translateCategory: (label) => translateCategory(label, language),
      isHindi: language === 'hi',
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  return ctx || createFallbackLanguageValue()
}
