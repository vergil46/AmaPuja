import { useState, useEffect } from 'react'
import api from '../services/api'
import Seo from '../components/Seo'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  })
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await api.get('/poojas')
      setServices(res.data)
    } catch (err) {
      console.error('Error fetching services:', err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await api.post('/enquiries', formData)
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', service: '', message: '' })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <Seo title="Contact Puja Samriddhi" description="Contact Puja Samriddhi for bookings and support." />
      
      <h1 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-6">Contact Us</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Contact Information */}
        <div className="bg-linear-to-br from-[#FFF8E1] to-[#FFF3C4] p-6 rounded-lg border border-[#FFE0A3]">
          <h2 className="text-xl font-semibold text-[#333333] mb-4">Get in Touch</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm text-[#333333]/70">Helpline</p>
                <p className="font-semibold text-[#333333]">9739362962</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-[#333333]/70">Email</p>
                <p className="font-semibold text-[#333333]">pujasamriddhi.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-[#333333]/70">Working Hours</p>
                <p className="font-semibold text-[#333333]">Mon - Sun: 9 AM - 9 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="bg-white border border-[#FFE0A3] p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-[#333333] mb-4">Send us an Enquiry</h2>
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded">
              Thank you! Your enquiry has been submitted successfully. We'll contact you soon.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#333333]/78 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#333333]/78 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#333333]/78 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] outline-none"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label htmlFor="service" className="block text-sm font-medium text-[#333333]/78 mb-1">
                Select Service (Optional)
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] outline-none bg-white"
              >
                <option value="">-- Select a Pooja/Service --</option>
                {services.map((service) => (
                  <option key={service._id} value={service.title}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#333333]/78 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:ring-2 focus:ring-[#FF6F00] focus:border-[#FF6F00] outline-none resize-none"
                placeholder="Tell us about your requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#D84315] to-[#FF6F00] hover:brightness-110 text-white font-medium py-2.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-linear-to-r from-[#FFF8E1] to-[#FFF3C4] p-6 rounded-lg border border-[#FFE0A3]">
        <h3 className="text-lg font-semibold text-[#333333] mb-3">Why Choose Puja Samriddhi?</h3>
        <ul className="grid sm:grid-cols-2 gap-2 text-[#333333]/82">
          <li className="flex items-start gap-2">
            <span className="text-[#FF6F00] mt-1">✓</span>
            <span>Experienced and authentic pandits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF6F00] mt-1">✓</span>
            <span>Traditional rituals with modern convenience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF6F00] mt-1">✓</span>
            <span>Available across Odia, Bengali, and Kannada traditions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#FF6F00] mt-1">✓</span>
            <span>Flexible booking and personalized services</span>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default ContactPage

