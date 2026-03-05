import { useState } from 'react'
import { languages } from '../i18n/translations'
import { useLanguage } from '../context/useLanguage'

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2.5 text-sm border border-stone-600/70 sm:border-stone-300 rounded-xl sm:rounded-lg bg-stone-900/60 sm:bg-transparent text-stone-100 sm:text-inherit hover:bg-stone-800/70 sm:hover:bg-stone-50 transition-colors"
      >
        <svg className="w-4 h-4 text-orange-200 sm:text-inherit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span>{currentLang?.nativeName}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 sm:w-48 bg-stone-950/95 sm:bg-white border border-stone-700/70 sm:border-stone-200 rounded-xl shadow-lg z-20 overflow-hidden backdrop-blur-sm">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-500/15 sm:hover:bg-orange-50 transition-colors ${
                  currentLanguage === lang.code
                    ? 'bg-orange-500/25 sm:bg-orange-100 text-orange-100 sm:text-orange-700 font-medium'
                    : 'text-stone-200 sm:text-stone-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-stone-400 sm:text-stone-500">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher
