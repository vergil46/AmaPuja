import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../context/useLanguage'
import Logo from './Logo'

function Header() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navClass = ({ isActive }) =>
    `text-sm md:text-[15px] font-medium px-2.5 py-1.5 rounded-md transition-colors ${
      isActive ? 'text-orange-800 bg-orange-100/80' : 'text-stone-700 hover:text-orange-700 hover:bg-orange-50'
    }`

  const mobileNavClass = ({ isActive }) =>
    `w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border transition-colors ${
      isActive
        ? 'text-orange-100 border-orange-400/50 bg-orange-800/60'
        : 'text-stone-200 border-stone-700/70 bg-stone-900/60 hover:text-orange-100 hover:border-orange-400/45 hover:bg-orange-700/20'
    }`

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-orange-200/90 bg-white/95 backdrop-blur-xl shadow-lg transition-shadow">
      <div className="bg-linear-to-r from-orange-100 via-amber-50 to-orange-100 text-right px-3.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm text-stone-700 border-b border-orange-100/80">
        Helpline: +91 90000 12345
      </div>
      <div className="max-w-6xl mx-auto px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        <Link to="/" onClick={closeMobileMenu} className="shrink-0 flex items-center">
          <Logo variant="default" className="scale-95 origin-left" />
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
          <NavLink to="/ratings" className={navClass}>
            Ratings
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
          className="lg:hidden px-3.5 py-2.5 rounded-2xl border border-orange-300/70 bg-linear-to-r from-orange-50 to-amber-50 text-orange-900 text-sm font-semibold shadow-sm hover:from-orange-100 hover:to-amber-100 transition-colors"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-orange-100/80 bg-orange-50/85 backdrop-blur animate-fade-up">
          <nav className="max-w-6xl mx-auto px-3.5 py-4" style={{ animationDelay: '0.05s' }}>
            <div className="rounded-2xl border border-orange-300/40 bg-stone-900/95 shadow-lg shadow-orange-900/20 p-4 flex flex-col gap-2.5">
            <NavLink to="/" className={mobileNavClass} onClick={closeMobileMenu}>
              {t('home')}
            </NavLink>
            <NavLink to="/services" className={mobileNavClass} onClick={closeMobileMenu}>
              {t('services')}
            </NavLink>
            <NavLink to="/about" className={mobileNavClass} onClick={closeMobileMenu}>
              {t('about')}
            </NavLink>
            <NavLink to="/ratings" className={mobileNavClass} onClick={closeMobileMenu}>
              Ratings
            </NavLink>
            <NavLink to="/contact" className={mobileNavClass} onClick={closeMobileMenu}>
              {t('contact')}
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={mobileNavClass} onClick={closeMobileMenu}>
                {t('dashboard')}
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={mobileNavClass} onClick={closeMobileMenu}>
                {t('admin')}
              </NavLink>
            )}

            <div className="mt-1 pt-3 border-t border-orange-300/30 flex flex-col gap-2.5">
              <div className="rounded-xl border border-stone-700/70 bg-stone-900/60 p-2.5">
                <LanguageSwitcher />
              </div>
              {user ? (
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-900 text-sm font-semibold hover:bg-white transition-colors"
                >
                  {t('logout')}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold text-center shadow-md shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600 transition-all"
                  >
                    {t('login')} / {t('signup')}
                  </Link>
                  <Link
                    to="/admin-login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-2xl border border-stone-500/70 bg-stone-100 text-stone-800 text-sm font-semibold text-center hover:bg-white transition-colors"
                  >
                    {t('admin')} {t('login')}
                  </Link>
                </>
              )}
            </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
