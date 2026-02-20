import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()

  const navClass = ({ isActive }) =>
    `text-sm font-medium ${isActive ? 'text-orange-700' : 'text-stone-700 hover:text-orange-700'}`

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
      <div className="bg-orange-50 text-right px-4 py-1 text-xs text-stone-700">Helpline: +91 90000 12345</div>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="text-2xl font-semibold text-orange-700">
          Ama Puja
        </Link>
        <nav className="hidden md:flex items-center gap-6">
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
        <div className="flex items-center gap-2">
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
      </div>
    </header>
  )
}

export default Header
