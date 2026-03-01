import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../context/LanguageContext'

function Header() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navClass = ({ isActive }) =>
    `text-sm md:text-[15px] font-medium px-2.5 py-1.5 rounded-md transition-colors ${
      isActive ? 'text-orange-800 bg-orange-100/80' : 'text-stone-700 hover:text-orange-700 hover:bg-orange-50'
    }`

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-orange-200/90 bg-white/95 backdrop-blur-xl shadow-lg transition-shadow">
      <div className="bg-linear-to-r from-orange-100 via-amber-50 to-orange-100 text-right px-4 py-1.5 text-xs sm:text-sm text-stone-700 border-b border-orange-100/80">
        Helpline: +91 90000 12345
      </div>
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
        <Link to="/" onClick={closeMobileMenu}>
          <Logo variant="default" />
        </Link>
        <nav className="hidden lg:flex items-center gap-3 rounded-full border border-orange-100 bg-white px-3 py-2 shadow-sm">
          <NavLink to="/" className={navClass}>
            {t('home')}
          </NavLink>
          <NavLink to="/services" className={navClass}>
            {t('services')}
          </NavLink>
          <NavLink to="/about" className={navClass}>
            {t('about')}
          </NavLink>
          <NavLink to="/blog" className={navClass}>
            Blog
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            {t('contact')}
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={navClass}>
              {t('dashboard')}
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navClass}>
              {t('admin')}
            </NavLink>
          )}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-stone-800 text-white text-sm font-medium shadow-sm hover:bg-stone-700 transition-colors"
            >
              {t('logout')}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 text-white text-sm font-medium shadow-sm hover:from-orange-700 hover:to-amber-700 transition-all"
              >
                {t('login')} / {t('signup')}
              </Link>
              <Link
                to="/admin-login"
                className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                {t('admin')} {t('login')}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm font-medium shadow-sm"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-orange-100 bg-white/95 backdrop-blur animate-fade-up">
          <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3" style={{ animationDelay: '0.05s' }}>
            <NavLink to="/" className={navClass} onClick={closeMobileMenu}>
              {t('home')}
            </NavLink>
            <NavLink to="/services" className={navClass} onClick={closeMobileMenu}>
              {t('services')}
            </NavLink>
            <NavLink to="/about" className={navClass} onClick={closeMobileMenu}>
              {t('about')}
            </NavLink>
            <NavLink to="/contact" className={navClass} onClick={closeMobileMenu}>
              {t('contact')}
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navClass} onClick={closeMobileMenu}>
                {t('dashboard')}
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navClass} onClick={closeMobileMenu}>
                {t('admin')}
              </NavLink>
            )}

            <div className="mt-1 pt-3 border-t border-orange-100 flex flex-col gap-2">
              <LanguageSwitcher />
              {user ? (
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 text-white text-sm font-medium"
                >
                  {t('logout')}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 text-white text-sm font-medium text-center"
                  >
                    {t('login')} / {t('signup')}
                  </Link>
                  <Link
                    to="/admin-login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 text-sm font-medium text-center"
                  >
                    {t('admin')} {t('login')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
