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
    `text-sm font-medium ${isActive ? 'text-orange-700' : 'text-stone-700 hover:text-orange-700'}`

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
      <div className="bg-orange-50 text-right px-4 py-1 text-xs text-stone-700">Helpline: +91 90000 12345</div>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link to="/" onClick={closeMobileMenu}>
          <Logo variant="default" />
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          <NavLink to="/" className={navClass}>
            {t('home')}
          </NavLink>
          <NavLink to="/services" className={navClass}>
            {t('services')}
          </NavLink>
          <NavLink to="/about" className={navClass}>
            {t('about')}
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
            <button onClick={logout} className="px-4 py-2 rounded-lg bg-stone-800 text-white text-sm">
              {t('logout')}
            </button>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-lg bg-orange-700 text-white text-sm">
                {t('login')} / {t('signup')}
              </Link>
              <Link to="/admin-login" className="px-4 py-2 rounded-lg bg-stone-800 text-white text-sm">
                {t('admin')} {t('login')}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden px-3 py-2 rounded-lg border border-stone-300 text-stone-800 text-sm"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-orange-100 bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
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

            <div className="pt-1 flex flex-col gap-2">
              <LanguageSwitcher />
              {user ? (
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-stone-800 text-white text-sm"
                >
                  {t('logout')}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2 rounded-lg bg-orange-700 text-white text-sm text-center"
                  >
                    {t('login')} / {t('signup')}
                  </Link>
                  <Link
                    to="/admin-login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2 rounded-lg bg-stone-800 text-white text-sm text-center"
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
