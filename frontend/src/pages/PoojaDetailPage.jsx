import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function PoojaDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const selectedCityFromServices = searchParams.get('city') === 'Bhubaneswar' ? 'Bhubaneswar' : 'Bangalore'
  const [pooja, setPooja] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState('Basic')
  const [bookingMessage, setBookingMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: selectedCityFromServices,
    priestPreference: 'Odia',
    date: '',
    time: '',
    address: '',
    specialNotes: '',
    paymentOption: 'full',
  })

  useEffect(() => {
    api.get(`/poojas/${id}`).then((res) => {
      setPooja(res.data)
      setSelectedPackage(res.data.packages?.[0]?.name || 'Basic')
    })
  }, [id])

  const packagePrice = useMemo(() => {
    const pkg = pooja?.packages?.find((item) => item.name === selectedPackage)
    return pkg?.price || 0
  }, [pooja, selectedPackage])

  const displayImage = getPoojaImage(pooja?.title, pooja?.image)

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handleBook = async (event) => {
    event.preventDefault()
    if (!token) {
      navigate('/login')
      return
    }

    const bookingRes = await api.post('/bookings', {
      poojaId: id,
      package: selectedPackage,
      ...form,
    })

    const booking = bookingRes.data

    if (form.paymentOption === 'pay-after-pooja') {
      setBookingMessage('Booking placed with pay-after-pooja mode. Waiting for manual confirmation.')
      return
    }

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setBookingMessage('Razorpay failed to load. Booking saved as pending.')
      return
    }

    const orderRes = await api.post('/payments/create-order', { bookingId: booking._id })
    const { order } = orderRes.data

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!razorpayKey) {
      setBookingMessage('Booking created. Add Razorpay key to complete online payment.')
      return
    }

    const options = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Ama Puja',
      description: `${pooja.title} Booking`,
      order_id: order.id,
      handler: async (response) => {
        await api.post('/payments/verify', response)
        setBookingMessage('Booking and payment completed successfully.')
      },
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: '#b45309' },
    }

    const rz = new window.Razorpay(options)
    rz.open()
  }

  if (!pooja) {
    return <div className="max-w-6xl mx-auto px-4 py-10">Loading puja details...</div>
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title={`${pooja.title} | Ama Puja`} description={pooja.description} />
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <img
            src={displayImage}
            alt={pooja.title}
            className="rounded-xl w-full h-72 object-cover"
            onError={(event) => {
              event.currentTarget.src = pooja.image
            }}
          />
          <h1 className="text-3xl font-semibold mt-5">{pooja.title}</h1>
          <p className="mt-3 text-stone-700">{pooja.description}</p>
          <div className="mt-6 space-y-2">
            {pooja.packages.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedPackage(item.name)}
                type="button"
                className={`w-full text-left p-3 rounded-lg border ${selectedPackage === item.name ? 'border-orange-600 bg-orange-50' : 'border-stone-200 bg-white'}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-semibold">₹{item.price}</span>
                </div>
                <p className="text-sm text-stone-600 mt-1">
                  {item.name === 'Basic' ? 'Without Samagri' : 'With Samagri'}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-lg overflow-hidden border border-stone-200">
            <iframe
              title="Map"
              src="https://www.google.com/maps?q=Bhubaneswar&output=embed"
              className="w-full h-64 border-0"
              loading="lazy"
            />
          </div>
        </div>
        <div className="bg-white border border-orange-100 rounded-xl p-5 h-fit">
          <h2 className="text-xl font-semibold">Book Now</h2>
          <p className="text-sm text-stone-600">Selected package: {selectedPackage} (₹{packagePrice})</p>
          <form onSubmit={handleBook} className="grid gap-3 mt-4">
            <input className="px-3 py-2 rounded border border-stone-300" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="px-3 py-2 rounded border border-stone-300" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="px-3 py-2 rounded border border-stone-300" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            
            <select
              className="px-3 py-2 rounded border border-stone-300"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
            </select>

            <select
              className="px-3 py-2 rounded border border-stone-300"
              value={form.priestPreference}
              onChange={(e) => setForm({ ...form, priestPreference: e.target.value })}
              required
            >
              <option value="Hindi">Priest Preference: Hindi</option>
              <option value="Odia">Priest Preference: Odia</option>
              <option value="Bengali">Priest Preference: Bengali</option>
              <option value="Kannada">Priest Preference: Kannada</option>
            </select>

            <input className="px-3 py-2 rounded border border-stone-300" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="px-3 py-2 rounded border border-stone-300" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <input className="px-3 py-2 rounded border border-stone-300" placeholder="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <textarea className="px-3 py-2 rounded border border-stone-300" rows={3} placeholder="Special Notes" value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} />
            <select
              className="px-3 py-2 rounded border border-stone-300"
              value={form.paymentOption}
              onChange={(e) => setForm({ ...form, paymentOption: e.target.value })}
            >
              <option value="full">Full Payment</option>
              <option value="advance-20">Advance Payment (20%)</option>
              <option value="advance-30">Advance Payment (30%)</option>
              <option value="pay-after-pooja">Pay After Puja</option>
            </select>
            <button className="px-4 py-2 rounded-lg bg-orange-700 text-white">Book Now</button>
          </form>
          {bookingMessage && <p className="text-sm text-green-700 mt-3">{bookingMessage}</p>}
        </div>
      </div>
    </section>
  )
}

export default PoojaDetailPage
