import { createContext, useContext, useState, useMemo } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem('appLanguage') || 'en'
  )

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode)
    localStorage.setItem('appLanguage', langCode)
  }

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  const value = useMemo(
    () => ({ currentLanguage, changeLanguage, t }),
    [currentLanguage]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
