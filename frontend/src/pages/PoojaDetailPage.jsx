import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'
import Seo from '../components/Seo'
import api from '../services/api'
import { PoojaDetailSkeleton } from '../components/LoadingSkeleton'

function PoojaDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const languageQuery = String(
    searchParams.get('language') || ''
  )
    .trim()
    .toLowerCase()

  const selectedLanguageFromServices = {
    odia: 'Odia',
    hindi: 'Hindi',
    bengali: 'Bengali',
    kannada: 'Kannada',
  }[languageQuery] || 'Odia'

  const selectedCityFromServices =
    searchParams.get('city') === 'Bhubaneswar'
      ? 'Bhubaneswar'
      : 'Bangalore'

  const [pooja, setPooja] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState('')
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [bookingMessage, setBookingMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: selectedCityFromServices,
    priestPreference:
      selectedLanguageFromServices,
    date: '',
    time: '',
    address: '',
    specialNotes: '',
    paymentOption: 'full',
  })

  useEffect(() => {
    api.get(`/poojas/${id}`).then((res) => {
      setPooja(res.data)
      setSelectedPackage('')
      setSelectedAddOns([])
    })
  }, [id])

  const activeLanguageKey = useMemo(
    () =>
      String(form.priestPreference || '')
        .trim()
        .toLowerCase(),
    [form.priestPreference]
  )

  const activeLanguagePricing = useMemo(() => {
    if (
      !pooja?.pricing ||
      typeof pooja.pricing !== 'object' ||
      !activeLanguageKey
    ) {
      return null
    }

    return pooja.pricing[activeLanguageKey] || null
  }, [pooja, activeLanguageKey])

  const languageOptions = useMemo(() => {
    const available = Array.isArray(
      pooja?.availableLanguages
    )
      ? pooja.availableLanguages
      : []

    if (available.length === 0) {
      return [
        'Odia',
        'Hindi',
        'Bengali',
        'Kannada',
      ]
    }

    return available.map((item) => {
      const value = String(item || '').trim()
      if (!value) return ''
      return (
        value.charAt(0).toUpperCase() +
        value.slice(1).toLowerCase()
      )
    }).filter(Boolean)
  }, [pooja])

  useEffect(() => {
    if (languageOptions.length === 0) return

    const hasCurrent = languageOptions.some(
      (option) =>
        option.toLowerCase() ===
        String(form.priestPreference || '')
          .toLowerCase()
    )

    if (!hasCurrent) {
      setForm((previous) => ({
        ...previous,
        priestPreference:
          languageOptions[0],
      }))
    }
  }, [languageOptions, form.priestPreference])

  const activePackages = useMemo(() => {
    if (
      activeLanguagePricing?.packages?.length > 0
    ) {
      return activeLanguagePricing.packages
    }

    return pooja?.packages || []
  }, [pooja, activeLanguagePricing])

  useEffect(() => {
    if (activePackages.length === 0) {
      if (selectedPackage) {
        setSelectedPackage('')
      }
      return
    }

    const hasSelected = activePackages.some(
      (pkg) => pkg.name === selectedPackage
    )

    if (!hasSelected) {
      setSelectedPackage(activePackages[0].name)
    }
  }, [activePackages, selectedPackage])

  const selectedPackageData = useMemo(() => {
    if (!selectedPackage) return null

    return (
      activePackages?.find(
        (pkg) => pkg.name === selectedPackage
      ) || null
    )
  }, [activePackages, selectedPackage])

  const availableAddOns = useMemo(() => {
    if (
      selectedPackageData?.addOns?.length > 0
    ) {
      return selectedPackageData.addOns
    }

    if (
      activeLanguagePricing?.addOns?.length > 0
    ) {
      return activeLanguagePricing.addOns
    }

    return pooja?.addOns || []
  }, [pooja, selectedPackageData, activeLanguagePricing])

  useEffect(() => {
    setSelectedAddOns([])
  }, [selectedPackage])

  // ✅ Dynamic Price Calculation
  const packagePrice = useMemo(() => {
    if (!selectedPackageData) return 0

    let total = Number(selectedPackageData?.price || 0)

    if (
      selectedAddOns.length > 0 &&
      availableAddOns.length > 0
    ) {
      selectedAddOns.forEach((addonName) => {
        const found = availableAddOns.find(
          (a) => a.name === addonName
        )
        if (found) total += found.price
      })
    }

    return total
  }, [selectedPackageData, selectedAddOns, availableAddOns])

  const payableAmount = useMemo(() => {
    if (form.paymentOption === 'advance')
      return Math.round(packagePrice * 0.3)
    if (form.paymentOption === 'pay-after-pooja') return 0
    return packagePrice
  }, [form.paymentOption, packagePrice])

  const payableLabel = useMemo(() => {
    if (form.paymentOption === 'advance') {
      return 'Advance (30%)'
    }
    if (form.paymentOption === 'pay-after-pooja') {
      return 'Pay After Pooja'
    }
    return 'Full Payment'
  }, [form.paymentOption])

  const basePackagePrice = Number(
    selectedPackageData?.price || 0
  )
  const addOnTotal = Math.max(
    0,
    packagePrice - basePackagePrice
  )

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
    if (isSubmitting) return

    const requiredFields = [
      form.name,
      form.phone,
      form.email,
      form.city,
      form.date,
      form.address,
    ]

    if (requiredFields.some((v) => !String(v || '').trim())) {
      setBookingMessage('Please fill all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const bookingRes = await api.post('/bookings', {
        poojaId: id,
        package: selectedPackage,
        selectedAddOns,
        ...form,
      })

      const booking = bookingRes.data

      if (form.paymentOption === 'pay-after-pooja') {
        setBookingMessage('Booking placed successfully.')
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        setBookingMessage('Razorpay failed to load.')
        return
      }

      const orderRes = await api.post(
        '/payments/create-order',
        { bookingId: booking._id }
      )

      const { order } = orderRes.data

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'PujaSamrddhi',
        description: `${displayTitle} Booking`,
        order_id: order.id,
        handler: async (response) => {
          await api.post('/payments/verify', response)
          setBookingMessage(
            'Booking and payment completed successfully.'
          )
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
      }

      const rz = new window.Razorpay(options)
      rz.open()
    } catch (error) {
      setBookingMessage(
        error?.response?.data?.message ||
          'Booking failed. Try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!pooja) return <PoojaDetailSkeleton />

  const displayImage = getPoojaImage(
    pooja?.title,
    pooja?.image
  )

  const localizedDescription =
    activeLanguagePricing?.description
      ?.full ||
    pooja?.localizedDescription?.[
      activeLanguageKey
    ]?.full ||
    ''

  const displayTitle =
    activeLanguagePricing?.title ||
    pooja?.localizedTitle?.[
      activeLanguageKey
    ] ||
    pooja?.title

  const displayDescription =
    localizedDescription ||
    pooja?.description

  const packageProcedure =
    selectedPackageData?.procedure?.filter(Boolean) ||
    []
  const packageInclusions =
    selectedPackageData?.inclusions?.filter(Boolean) ||
    []
  const packageNote =
    selectedPackageData?.note || ''

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo
        title={`${displayTitle} | PujaSamrddhi`}
        description={displayDescription}
      />

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <img
            src={displayImage}
            alt={displayTitle}
            className="rounded-xl w-full h-64 object-cover"
          />

          <h1 className="text-3xl font-semibold mt-5">
            {displayTitle}
          </h1>

          <p className="mt-3 text-stone-700">
            {displayDescription}
          </p>

          {/* Packages */}
          <div className="mt-6 border rounded-xl p-4 bg-stone-50">
            <div className="text-lg font-semibold mb-3">
              Select Package
            </div>

            {activePackages.map((pkg) => (
              <label
                key={pkg.name}
                className="block border p-3 rounded mb-3"
              >
                <input
                  type="radio"
                  name="package"
                  checked={selectedPackage === pkg.name}
                  onChange={() =>
                    setSelectedPackage(pkg.name)
                  }
                />{' '}
                {pkg.name} – ₹{pkg.price}
              </label>
            ))}

            {/* Add-ons */}
            {availableAddOns.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold">
                  Add-ons
                </div>

                {availableAddOns.map((addon) => (
                  <label
                    key={addon.name}
                    className="flex items-center gap-2 mt-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddOns.includes(
                        addon.name
                      )}
                      onChange={() => {
                        if (
                          selectedAddOns.includes(
                            addon.name
                          )
                        ) {
                          setSelectedAddOns(
                            selectedAddOns.filter(
                              (a) => a !== addon.name
                            )
                          )
                        } else {
                          setSelectedAddOns([
                            ...selectedAddOns,
                            addon.name,
                          ])
                        }
                      }}
                    />
                    {addon.name} +₹{addon.price}
                  </label>
                ))}
              </div>
            )}

            {selectedPackageData && (
              <div className="mt-5 p-4 border rounded-xl bg-stone-50">
                <div className="text-sm text-stone-700 space-y-2">
                  {selectedPackageData.pandits && (
                    <p>
                      <span className="font-semibold text-stone-900">
                        Package:
                      </span>{' '}
                      {selectedPackageData.pandits}
                    </p>
                  )}

                  {selectedPackageData.description && (
                    <p>{selectedPackageData.description}</p>
                  )}

                  {packageProcedure.length > 0 && (
                    <div>
                      <p className="font-semibold text-stone-900">
                        Procedure involved:
                      </p>
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        {packageProcedure.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {packageInclusions.length > 0 && (
                    <div>
                      <p className="font-semibold text-stone-900">
                        Inclusions:
                      </p>
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        {packageInclusions.map(
                          (inclusion) => (
                            <li key={inclusion}>
                              {inclusion}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {packageNote && (
                    <p>
                      <span className="font-semibold text-stone-900">
                        Note:
                      </span>{' '}
                      {packageNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 font-semibold text-green-700">
              Total: ₹{packagePrice}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="rounded-2xl border border-stone-300 bg-stone-100 p-4 shadow-sm">
          <h2 className="text-2xl font-semibold uppercase tracking-wide text-stone-900">
            Book Now
          </h2>

          <p className="mt-1 text-sm text-stone-600">
            Secure your pooja booking in just a few steps
          </p>

          <div className="mt-3 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700">
            Payable Now ({payableLabel}): ₹{payableAmount}
          </div>

          <div className="mt-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <span>Package</span>
              <span>₹{basePackagePrice}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Add-ons</span>
              <span>₹{addOnTotal}</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-semibold text-stone-900">
              <span>Final Amount</span>
              <span>₹{packagePrice}</span>
            </div>
          </div>

          <form
            onSubmit={handleBook}
            className="mt-3 space-y-3"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                placeholder="Full Name *"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <input
                className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                placeholder="Phone *"
                required
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <input
              className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
              type="email"
              placeholder="Email *"
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />

            <select
              className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
              value={form.city}
              onChange={(e) =>
                setForm({
                  ...form,
                  city: e.target.value,
                })
              }
            >
              <option value="">Select City</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
            </select>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                value={form.priestPreference}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priestPreference: e.target.value,
                  })
                }
              >
                <option value="">Select Language</option>
                {languageOptions.map((language) => (
                  <option
                    key={language}
                    value={language}
                  >
                    {language}
                  </option>
                ))}
              </select>

              <input
                className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm({
                    ...form,
                    time: e.target.value,
                  })
                }
              />
            </div>

            <input
              className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
              type="date"
              required
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
            />

            <input
              className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
              placeholder="Address *"
              required
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                className="w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-500"
                value={form.paymentOption}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentOption: e.target.value,
                  })
                }
              >
                <option value="full">Full Payment</option>
                <option value="advance">Advance (30%)</option>
                <option value="pay-after-pooja">Pay After Pooja</option>
              </select>

              <button className="w-full rounded-md bg-stone-800 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-stone-900 disabled:opacity-60">
                {isSubmitting
                  ? 'Booking...'
                  : 'Book Now'}
              </button>
            </div>
          </form>

          {bookingMessage && (
            <p className="mt-3 text-green-700">
              {bookingMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default PoojaDetailPage