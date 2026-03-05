import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import WhatsAppButton from './WhatsAppButton'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default Layout
