import { Link } from 'react-router-dom'
import homeBackground from '../assets/poojas/background-optimized.webp'
import Seo from '../components/Seo'

function HomePage() {
  return (
    <>
      <Seo
        title="Ama Puja | Trusted Pandit Booking"
        description="Book trusted pandits for sacred rituals with transparent packages and secure online booking."
      />
      <section
        className="min-h-[70vh] bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            `linear-gradient(to right, rgba(51,37,17,.85), rgba(51,37,17,.45)), url(${homeBackground})`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-24 text-white">
          <p className="uppercase text-xs tracking-widest text-orange-200">Sacred • Trusted • Professional</p>
          <h1 className="text-4xl md:text-5xl font-semibold mt-3 max-w-2xl">Book Trusted Pandits for Your Sacred Rituals</h1>
          <p className="mt-4 max-w-xl text-orange-50">
            Premium puja support for homes and temples with verified priests, transparent pricing, and smooth booking.
          </p>
          <Link to="/services" className="inline-block mt-8 px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700">
            Book a Puja
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold">Why Families Choose Ama Puja</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <article className="bg-white border border-orange-100 rounded-xl p-5">
            <h3 className="font-semibold text-stone-800">Verified Priests</h3>
            <p className="mt-2 text-sm text-stone-600">Experienced priests for all major rituals in your preferred language.</p>
          </article>
          <article className="bg-white border border-orange-100 rounded-xl p-5">
            <h3 className="font-semibold text-stone-800">Transparent Packages</h3>
            <p className="mt-2 text-sm text-stone-600">Simple and clear package prices with secure booking confirmation.</p>
          </article>
          <article className="bg-white border border-orange-100 rounded-xl p-5">
            <h3 className="font-semibold text-stone-800">City-Wise Service</h3>
            <p className="mt-2 text-sm text-stone-600">Available in Bangalore and Bhubaneswar with timely support.</p>
          </article>
        </div>
      </section>
    </>
  )
}

export default HomePage
