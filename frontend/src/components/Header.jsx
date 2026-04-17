import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '../context/useLanguage'
import Logo from './Logo'

function Header() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const accountRoute = user?.role === 'admin' ? '/admin' : '/dashboard'
  const bookingsRoute = '/dashboard#bookings'
  const feedbackRoute = '/dashboard#feedback'
  const accountLabel = user?.role === 'admin' ? t('admin') : t('dashboard')
  const accountInitial = (user?.name?.trim()?.[0] || user?.email?.trim()?.[0] || accountLabel?.[0] || 'A').toUpperCase()

  const navClass = ({ isActive }) =>
    `whitespace-nowrap text-sm md:text-[14px] lg:text-[15px] font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
      isActive ? 'text-[#FF6F00] bg-[#FFF8E1]' : 'text-stone-700 hover:text-[#FF6F00] hover:bg-[#FFF8E1]'
    }`

  const mobileNavClass = ({ isActive }) =>
    `w-full text-sm font-medium px-3.5 py-2.5 rounded-xl border transition-colors ${
      isActive
        ? 'text-[#FFF8E1] border-[#D84315]/50 bg-[#D84315]/85'
        : 'text-stone-200 border-stone-700/70 bg-stone-900/60 hover:text-[#FFF8E1] hover:border-[#FF6F00]/45 hover:bg-[#D84315]/25'
    }`

  const closeMobileMenu = () => setMobileMenuOpen(false)

  useEffect(() => {
    if (!accountMenuOpen) return undefined

    const handleDocumentClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [accountMenuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-[#FFF0C2]/90 bg-[#FFF8E1]/94 backdrop-blur-xl shadow-sm transition-shadow">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        <Link to="/" onClick={closeMobileMenu} className="shrink-0 flex items-center">
          <Logo variant="default" className="scale-95 origin-left" />
        </Link>
        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-[#FFE0A3]/80 bg-white/95 px-3 py-1.5 shadow-sm">
          <NavLink to="/" className={navClass}>
            {t('home')}
          </NavLink>
          <NavLink to="/about" className={navClass}>
            {t('about')}
          </NavLink>
          <NavLink to="/services" className={navClass}>
            {t('services')}
          </NavLink>
          <NavLink to="/online-pandit-booking-bangalore" className={navClass}>
            Bangalore Pandit
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            {t('contact')}
          </NavLink>
          <NavLink to="/ratings" className={navClass}>
            Reviews
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
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-[#FFE0A3]/80 bg-white/95 px-1.5 py-1.5 shadow-sm animate-fade-up" style={{ animationDelay: '0.04s' }}>
            <div className="rounded-xl border border-[#FFE0A3]/80 bg-white px-1.5 py-1 shadow-xs">
              <LanguageSwitcher />
            </div>
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#FF6F00]/35 bg-white text-[#FF6F00] text-sm font-semibold hover:bg-[#FFF8E1] transition-colors"
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-[#D84315] to-[#FF6F00] text-[11px] font-bold text-white shadow-sm">
                    {accountInitial}
                  </span>
                  {accountLabel}
                  <span className="text-xs text-[#FF6F00]/80">▾</span>
                </button>

                {accountMenuOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-55 overflow-hidden rounded-2xl border border-[#FFE0A3]/90 bg-white shadow-xl shadow-orange-900/10 animate-fade-up"
                    style={{ animationDelay: '0.02s' }}
                    role="menu"
                    aria-label="Account menu"
                  >
                    <div className="border-b border-[#FFF0C2] bg-linear-to-r from-[#FFF8E1] to-[#FFF3C4] px-4 py-3">
                      <p className="text-[11px] font-semibold tracking-wide text-[#FF6F00]/80">SIGNED IN</p>
                      <p className="mt-0.5 text-sm font-semibold text-stone-900">{user?.name || user?.email || 'Account'}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to={bookingsRoute}
                        onClick={() => setAccountMenuOpen(false)}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-800 hover:bg-[#FFF8E1] hover:text-[#FF6F00] transition-colors"
                        role="menuitem"
                      >
                        My Bookings
                      </Link>
                      <Link
                        to={feedbackRoute}
                        onClick={() => setAccountMenuOpen(false)}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-800 hover:bg-[#FFF8E1] hover:text-[#FF6F00] transition-colors"
                        role="menuitem"
                      >
                        My Feedback
                      </Link>
                      <Link
                        to={accountRoute}
                        onClick={() => setAccountMenuOpen(false)}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-800 hover:bg-[#FFF8E1] hover:text-[#FF6F00] transition-colors inline-flex items-center gap-2"
                        role="menuitem"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF0C2] text-[10px] font-bold text-[#FF6F00]">
                          {accountInitial}
                        </span>
                        {accountLabel}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false)
                          logout()
                        }}
                        className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-stone-800 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        role="menuitem"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="whitespace-nowrap px-4 py-2 rounded-xl bg-linear-to-r from-[#D84315] via-[#FF6F00] to-[#FF8F00] text-white text-sm font-semibold shadow-md shadow-orange-400/30 hover:from-[#C63B12] hover:via-[#F57C00] hover:to-[#FB8C00] transition-all"
                >
                  {t('login')} / {t('signup')}
                </Link>
                <Link
                  to="/admin-login"
                  className="whitespace-nowrap px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-sm font-semibold hover:bg-stone-50 transition-colors"
                >
                  {t('admin')} {t('login')}
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          className="md:hidden px-3.5 py-2.5 rounded-2xl border border-[#FF6F00]/35 bg-linear-to-r from-[#FFF8E1] to-[#FFF3C4] text-[#FF6F00] text-sm font-semibold shadow-sm hover:from-[#FFF3C4] hover:to-[#FFE0A3] transition-colors"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#FFF0C2]/80 bg-[#FFF8E1]/92 backdrop-blur animate-fade-up">
          <nav className="max-w-6xl mx-auto px-3.5 py-4" style={{ animationDelay: '0.05s' }}>
            <div className="rounded-2xl border border-[#FF6F00]/30 bg-stone-900/95 shadow-lg shadow-orange-900/20 p-4 flex flex-col gap-2.5">
            <NavLink to="/" className={mobileNavClass} onClick={closeMobileMenu}>
              {t('home')}
            </NavLink>
            <NavLink to="/services" className={mobileNavClass} onClick={closeMobileMenu}>
              {t('services')}
            </NavLink>
            <NavLink to="/about" className={mobileNavClass} onClick={closeMobileMenu}>
              {t('about')}
            </NavLink>
            <NavLink to="/online-pandit-booking-bangalore" className={mobileNavClass} onClick={closeMobileMenu}>
              Bangalore Pandit
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
                <>
                  <Link
                    to={bookingsRoute}
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#FF6F00]/35 bg-[#FFF0C2] text-[#D84315] text-sm font-semibold text-center hover:bg-[#FFF8E1] transition-colors"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to={feedbackRoute}
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#FF6F00]/35 bg-[#FFF0C2] text-[#D84315] text-sm font-semibold text-center hover:bg-[#FFF8E1] transition-colors"
                  >
                    My Feedback
                  </Link>
                  <Link
                    to={accountRoute}
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#FF6F00]/35 bg-[#FFF0C2] text-[#D84315] text-sm font-semibold text-center hover:bg-[#FFF8E1] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-[#D84315] to-[#FF6F00] text-[11px] font-bold text-white shadow-sm">
                      {accountInitial}
                    </span>
                    {accountLabel}
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-900 text-sm font-semibold hover:bg-white transition-colors"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2.5 rounded-2xl bg-linear-to-r from-[#D84315] via-[#FF6F00] to-[#FF8F00] text-white text-sm font-semibold text-center shadow-md shadow-orange-500/30 hover:from-[#C63B12] hover:via-[#F57C00] hover:to-[#FB8C00] transition-all"
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
