import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { PoojaDetailSkeleton } from '../components/LoadingSkeleton'

// Auto book logic
// ...existing code...

function PoojaDetailPage() {
    // State for Flowers & Fruits checkbox (only for Odia Namkaran Puja With Samagri)
    const [includeFlowersFruits, setIncludeFlowersFruits] = useState(false);
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const selectedCityFromServices = searchParams.get('city') === 'Bhubaneswar' ? 'Bhubaneswar' : 'Bangalore'
  const [pooja, setPooja] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState('With Samagri')
  const [bookingMessage, setBookingMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      // Filter out 'Without Samagri' packages
      const filtered = {
        ...res.data,
        packages: Array.isArray(res.data.packages)
          ? res.data.packages.filter((item) => item.name !== 'Without Samagri' && item.includesSamagri !== false)
          : [],
      };
      setPooja(filtered);
      setSelectedPackage(filtered.packages?.[0]?.name || 'With Samagri');
    });
  }, [id]);

  const packagePrice = useMemo(() => {
    const pkg = pooja?.packages?.find((item) => item.name === selectedPackage)
    let price = pkg?.price || 0;
    // Add ₹1000 if Odia Namkaran Puja (Ekoisia) With Samagri and checkbox is checked
    if (
      pooja?.title === 'Namkaran Puja (Ekoisia)'
      && form.priestPreference === 'Odia'
      && selectedPackage === 'With Samagri'
      && includeFlowersFruits
    ) {
      price += 1000;
    }
    return price;
  }, [pooja, selectedPackage, form.priestPreference, includeFlowersFruits]);

  const payableAmount = useMemo(() => {
    if (form.paymentOption === 'advance') {
      return Math.round(packagePrice * 0.3)
    }
    if (form.paymentOption === 'pay-after-pooja') {
      return 0
    }
    return packagePrice
  }, [form.paymentOption, packagePrice])

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
    setBookingMessage('')
    // Allow booking without login
    if (isSubmitting) {
      return
    }

    const requiredFields = [
      form.name,
      form.phone,
      form.email,
      form.city,
      form.priestPreference,
      form.date,
      form.address,
    ] // time is now optional

    if (requiredFields.some((value) => !String(value || '').trim())) {
      setBookingMessage('Please fill all required fields before booking.')
      return
    }

    setIsSubmitting(true)
    setBookingMessage('Submitting booking...')

    try {
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
        name: 'PujaSamrddhi',
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

      try {
        const rz = new window.Razorpay(options)
        rz.open()
      } catch (razorpayError) {
        console.error('Razorpay init error:', razorpayError)
        setBookingMessage('Payment could not be started. Please try again.')
      }
    } catch (error) {
      const status = error?.response?.status
      if (status === 401 && form.paymentOption !== 'pay-after-pooja') {
        setBookingMessage('Please login to complete your booking payment.')
        navigate('/login')
        return
      }

      setBookingMessage(error?.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!pooja) {
    return <PoojaDetailSkeleton />
  }

  // Determine tradition based on priestPreference
  const getTradition = (lang) => {
    if (lang === 'Hindi') return 'Hindi';
    if (lang === 'Bengali') return 'Bengali';
    if (lang === 'Kannada') return 'Kannada';
    return 'Odia';
  };
  const selectedTradition = getTradition(form.priestPreference);

  // Replace all occurrences of tradition in description (case-insensitive, global)
  const getDescriptionWithTradition = (desc) => {
    return desc.replace(/Odia|Hindi|Bengali|Kannada/gi, selectedTradition);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title={`${pooja.title} | PujaSamrddhi`} description={getDescriptionWithTradition(pooja.description)} />
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <img
            src={displayImage}
            alt={pooja.title}
            loading="lazy"
            className="rounded-xl w-full h-56 sm:h-72 object-cover"
            onError={(event) => {
              event.currentTarget.src = pooja.image
            }}
          />
          <h1 className="text-2xl sm:text-3xl font-semibold mt-5 wrap-break-word">{pooja.title}</h1>
          <p className="mt-3 text-stone-700">{getDescriptionWithTradition(pooja.description)}</p>
          <div className="mt-6 space-y-2">
            {pooja.packages.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedPackage(item.name)}
                type="button"
                className={`w-full text-left p-3 rounded-lg border ${selectedPackage === item.name ? 'border-orange-600 bg-orange-50' : 'border-stone-200 bg-white'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-semibold">₹{item.price}</span>
                </div>
                <p className="text-sm text-stone-600 mt-1">With Samagri</p>
              </button>
            ))}
          </div>

          {/* Special inclusions and procedure for Odia Namkaran Puja (Ekoisia) With Samagri */}
          {pooja.title === 'Namkaran Puja (Ekoisia)' && form.priestPreference === 'Odia' && selectedPackage === 'With Samagri' && (
            <div className="mt-6 border rounded-xl p-4 bg-stone-50">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="font-semibold mb-2">Standard : (1 Panditji + All Puja Samagries)</div>
                  <div className="font-semibold">Procedure involved:</div>
                  <ul className="list-disc ml-5 text-sm mt-1">
                    <li>Ghata Sthapana</li>
                    <li>Sankalpa</li>
                    <li>Ganapathi Panchdevta Puja</li>
                    <li>Navagraha Mandala Puja</li>
                    <li>Narayan Puja</li>
                    <li>Satyanarayan Katha</li>
                    <li>Havan</li>
                    <li>Neivedhya</li>
                    <li>Aarti</li>
                    <li>Pushpanjali</li>
                    <li>Namakaran</li>
                    <li>Bhojya daana</li>
                  </ul>
                    <div className="mt-4 p-3 rounded-lg bg-yellow-100 border border-yellow-400 text-base text-yellow-900 font-semibold">
                      <b>Note:</b> Puja Samagri like Haldi, Abeer, Gulal, Mango leaves, Tulasi, Darba, Kalash, Beetle Leaves, Beetle Nuts, Havan Sticks, Samidha, Havan Kund, Dravyas, Kapda, Ghee etc. will be brought by us.<br /><br />
                      Yajaman has to keep house items like Vessels, Oil Lamps, Mats, Bowls, Chowki, Plates, Prasad, Photos etc. You will be receiving a detailed to-do list after booking.
                    </div>
                </div>
                <div className="flex-1 border-l pl-6">
                  <div className="font-semibold mb-2">Inclusions</div>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2"><span className="text-green-600">&#10003;</span> Dakshina</div>
                    <div className="flex items-center gap-2"><span className="text-green-600">&#10003;</span> All Puja Samagaries</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeFlowersFruits}
                        onChange={e => setIncludeFlowersFruits(e.target.checked)}
                        className="accent-green-600"
                      />
                      Flowers & Fruits{includeFlowersFruits ? ' (+₹1000)' : ''}
                    </label>
                  </div>
                  <div className="mt-4 text-lg font-semibold text-green-700">Rs {(packagePrice).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white border border-orange-100 rounded-xl p-4 sm:p-5 h-fit">
          <h2 className="text-xl font-semibold">Book Now</h2>
          <p className="text-sm text-stone-600">Selected package: {selectedPackage} (₹{packagePrice})</p>
          <p className="text-sm text-stone-600 mt-1">Payable now: ₹{payableAmount}</p>
          <form onSubmit={handleBook} className="grid gap-3 mt-4">
            <input className="w-full px-3 py-2 rounded border border-stone-300" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full px-3 py-2 rounded border border-stone-300" placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="w-full px-3 py-2 rounded border border-stone-300" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            
            <select
              className="w-full px-3 py-2 rounded border border-stone-300"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
            </select>

            <select
              className="w-full px-3 py-2 rounded border border-stone-300"
              value={form.priestPreference}
              onChange={(e) => setForm({ ...form, priestPreference: e.target.value })}
              required
            >
              <option value="Hindi">Priest Preference: Hindi</option>
              <option value="Odia">Priest Preference: Odia</option>
              <option value="Bengali">Priest Preference: Bengali</option>
              <option value="Kannada">Priest Preference: Kannada</option>
            </select>

            <input className="w-full px-3 py-2 rounded border border-stone-300" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="w-full px-3 py-2 rounded border border-stone-300" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="Time (optional)" />
            <input className="w-full px-3 py-2 rounded border border-stone-300" placeholder="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <textarea className="w-full px-3 py-2 rounded border border-stone-300" rows={3} placeholder="Special Notes" value={form.specialNotes} onChange={(e) => setForm({ ...form, specialNotes: e.target.value })} />
            <select
              className="w-full px-3 py-2 rounded border border-stone-300"
              value={form.paymentOption}
              onChange={(e) => setForm({ ...form, paymentOption: e.target.value })}
            >
              <option value="full">Full Payment</option>
              <option value="advance">Advance Payment (30%)</option>
              <option value="pay-after-pooja">Pay After Puja</option>
            </select>
            <button
              className="px-4 py-2 rounded-lg bg-orange-700 text-white disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Now'}
            </button>
          </form>
          {bookingMessage && <p className="text-sm text-green-700 mt-3">{bookingMessage}</p>}
        </div>
      </div>
    </section>
  )
}

export default PoojaDetailPage
