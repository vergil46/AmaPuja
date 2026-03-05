import { useCallback, useState, useMemo } from 'react'
import { translations } from '../i18n/translations'
import { LanguageContext } from './language-context'

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('appLanguage') || 'en'
  )

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode)
    localStorage.setItem('appLanguage', langCode)
  }

  const t = useCallback((key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }, [currentLanguage])

  const value = useMemo(
    () => ({ currentLanguage, changeLanguage, t }),
    [currentLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
