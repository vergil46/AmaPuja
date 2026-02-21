import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navClass = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-orange-700' : 'text-stone-700 hover:text-orange-700'}`

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
      <div className="bg-orange-50 text-right px-4 py-1 text-xs text-stone-700">Helpline: +91 90000 12345</div>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link to="/" className="text-xl sm:text-2xl font-semibold text-orange-700" onClick={closeMobileMenu}>
          Ama Puja
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/services" className={navClass}>
            Services
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navClass}>
            Contact
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <button onClick={logout} className="px-4 py-2 rounded-lg bg-stone-800 text-white text-sm">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-lg bg-orange-700 text-white text-sm">
                Customer Login / Signup
              </Link>
              <Link to="/admin-login" className="px-4 py-2 rounded-lg bg-stone-800 text-white text-sm">
                Admin Login
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
              Home
            </NavLink>
            <NavLink to="/services" className={navClass} onClick={closeMobileMenu}>
              Services
            </NavLink>
            <NavLink to="/about" className={navClass} onClick={closeMobileMenu}>
              About
            </NavLink>
            <NavLink to="/contact" className={navClass} onClick={closeMobileMenu}>
              Contact
            </NavLink>
            {user && (
              <NavLink to="/dashboard" className={navClass} onClick={closeMobileMenu}>
                Dashboard
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={navClass} onClick={closeMobileMenu}>
                Admin
              </NavLink>
            )}

            <div className="pt-1 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-stone-800 text-white text-sm"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2 rounded-lg bg-orange-700 text-white text-sm text-center"
                  >
                    Customer Login / Signup
                  </Link>
                  <Link
                    to="/admin-login"
                    onClick={closeMobileMenu}
                    className="w-full px-4 py-2 rounded-lg bg-stone-800 text-white text-sm text-center"
                  >
                    Admin Login
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
