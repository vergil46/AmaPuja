import Footer from './Footer'
import Header from './Header'
import WhatsAppButton from './WhatsAppButton'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default Layout
