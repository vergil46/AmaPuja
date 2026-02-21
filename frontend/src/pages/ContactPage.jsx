import Seo from '../components/Seo'

function ContactPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <Seo title="Contact Ama Puja" description="Contact Ama Puja for bookings and support." />
      <h1 className="text-2xl sm:text-3xl font-semibold">Contact Us</h1>
      <p className="mt-4 text-stone-700">Helpline: +91 90000 12345</p>
      <p className="text-stone-700">Email: support@amapuja.com</p>
    </section>
  )
}

export default ContactPage
