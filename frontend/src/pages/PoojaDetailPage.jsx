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

  const normalizeName = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()

  const parseAmount = (value) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }

    const cleaned = String(value || '').replace(
      /[^\d.-]/g,
      ''
    )
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : 0
  }

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
    const candidates = [
      ...(Array.isArray(selectedPackageData?.addOns)
        ? selectedPackageData.addOns
        : []),
      ...(Array.isArray(activeLanguagePricing?.addOns)
        ? activeLanguagePricing.addOns
        : []),
      ...(Array.isArray(pooja?.addOns)
        ? pooja.addOns
        : []),
    ]

    const byName = new Map()
    candidates.forEach((addon) => {
      const name = String(addon?.name || '').trim()
      const key = normalizeName(name)
      if (!key) return

      if (!byName.has(key)) {
        byName.set(key, {
          name,
          price: parseAmount(addon?.price),
        })
      }
    })

    return Array.from(byName.values())
  }, [pooja, selectedPackageData, activeLanguagePricing])

  useEffect(() => {
    setSelectedAddOns([])
  }, [selectedPackage])

  // ✅ Dynamic Price Calculation
  const packagePrice = useMemo(() => {
    if (!selectedPackageData) return 0

    let total = parseAmount(selectedPackageData?.price)

    if (
      selectedAddOns.length > 0 &&
      availableAddOns.length > 0
    ) {
      selectedAddOns.forEach((addonName) => {
        const found = availableAddOns.find(
          (a) =>
            normalizeName(a.name) ===
            normalizeName(addonName)
        )
        if (found) total += parseAmount(found.price)
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

  const basePackagePrice = parseAmount(
    selectedPackageData?.price
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

    const enquiryTitle =
      activeLanguagePricing?.title ||
      pooja?.localizedTitle?.[
        activeLanguageKey
      ] ||
      pooja?.title ||
      ''

    const isEnquiryOnly =
      activeLanguageKey === 'bengali' &&
      /vivah/i.test(String(enquiryTitle || ''))

    const requiredFields = [
      form.name,
      form.phone,
      form.email,
      form.city,
      form.address,
      ...(isEnquiryOnly ? [] : [form.date]),
    ]

    if (requiredFields.some((v) => !String(v || '').trim())) {
      setBookingMessage('Please fill all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isEnquiryOnly) {
        const enquiryLines = [
          `Priest Preference: ${form.priestPreference}`,
          `City: ${form.city}`,
          form.date
            ? `Preferred Date: ${form.date}`
            : '',
          form.time
            ? `Preferred Time: ${form.time}`
            : '',
          `Address: ${form.address}`,
          form.specialNotes
            ? `Requirements: ${form.specialNotes}`
            : '',
        ].filter(Boolean)

        await api.post('/enquiries', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: enquiryTitle,
          message: enquiryLines.join('\n'),
        })

        setBookingMessage(
          'Enquiry sent successfully. Our team will contact you with quotation details.'
        )
        return
      }

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
        {
          bookingId: booking._id,
          finalAmount: packagePrice,
        }
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

  const isBengaliVivahEnquiryOnly =
    activeLanguageKey === 'bengali' &&
    /vivah/i.test(String(displayTitle || ''))

  const fieldClass =
    'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <Seo
        title={`${displayTitle} | PujaSamrddhi`}
        description={displayDescription}
      />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        <div>
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <img
              src={displayImage}
              alt={displayTitle}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold mt-5 text-stone-900 leading-tight">
            {displayTitle}
          </h1>

          <p className="mt-3 text-lg leading-relaxed text-stone-700">
            {displayDescription}
          </p>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="text-lg font-semibold mb-3 text-stone-900">
              {isBengaliVivahEnquiryOnly
                ? 'Custom Quotation'
                : 'Select Package'}
            </div>

            {!isBengaliVivahEnquiryOnly &&
              activePackages.map((pkg) => (
                <label
                  key={pkg.name}
                  className={`block border p-3.5 rounded-xl mb-3 cursor-pointer transition ${
                    selectedPackage === pkg.name
                      ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-100'
                      : 'border-stone-300 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="package"
                        className="h-4 w-4 accent-orange-600"
                        checked={selectedPackage === pkg.name}
                        onChange={() =>
                          setSelectedPackage(pkg.name)
                        }
                      />
                      <span className="font-medium text-stone-900">
                        {pkg.name}
                      </span>
                    </div>
                    <span className="font-semibold text-stone-900">
                      ₹{pkg.price}
                    </span>
                  </div>
                </label>
              ))}

            {isBengaliVivahEnquiryOnly && (
              <div className="rounded-xl border border-red-200 bg-linear-to-br from-red-50 to-orange-50 p-4 text-sm text-stone-700 shadow-sm">
                <p className="font-semibold text-stone-900">
                  This service is available on custom quotation.
                </p>
                <p className="mt-2 leading-relaxed">
                  Share your requirements and our team will contact you with package details, pandit availability, and final quote.
                </p>
              </div>
            )}

            {!isBengaliVivahEnquiryOnly &&
              availableAddOns.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold text-stone-900">
                  Add-ons
                </div>

                {availableAddOns.map((addon) => (
                  <label
                    key={addon.name}
                    className={`mt-2 flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition ${
                      selectedAddOns.some(
                        (item) =>
                          normalizeName(item) ===
                          normalizeName(addon.name)
                      )
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-stone-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-orange-600"
                      checked={selectedAddOns.some(
                        (item) =>
                          normalizeName(item) ===
                          normalizeName(addon.name)
                      )}
                      onChange={() => {
                        const addonName = String(
                          addon.name || ''
                        ).trim()
                        const addonKey = normalizeName(
                          addonName
                        )

                        setSelectedAddOns((previous) => {
                          const exists = previous.some(
                            (item) =>
                              normalizeName(item) ===
                              addonKey
                          )

                          if (exists) {
                            return previous.filter(
                              (item) =>
                                normalizeName(item) !==
                                addonKey
                            )
                          }

                          return [
                            ...previous,
                            addonName,
                          ]
                        })
                      }}
                    />
                    {addon.name}
                  </label>
                ))}
              </div>
            )}

            {!isBengaliVivahEnquiryOnly &&
              selectedPackageData && (
              <div className="mt-5 p-4 border border-stone-200 rounded-xl bg-stone-50">
                <div className="text-sm text-stone-700 space-y-2.5">
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

            {!isBengaliVivahEnquiryOnly && (
              <div className="mt-4 font-semibold text-green-700">
                Total Amount (Price + Add-ons): ₹{packagePrice}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-300 bg-stone-100/95 p-4 sm:p-5 shadow-md lg:sticky lg:top-24">
          <h2 className="text-2xl font-semibold uppercase tracking-wide text-stone-900">
            {isBengaliVivahEnquiryOnly
              ? 'Send Enquiry'
              : 'Book Now'}
          </h2>

          <p className="mt-1 text-sm text-stone-600">
            {isBengaliVivahEnquiryOnly
              ? 'Share your event details and get a personalized quote from our team.'
              : 'Secure your pooja booking in just a few steps'}
          </p>

          {!isBengaliVivahEnquiryOnly && (
            <div className="mt-3 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700">
              Payable Now ({payableLabel}): ₹{payableAmount}
            </div>
          )}

          {!isBengaliVivahEnquiryOnly && (
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
              <div className="mt-1 text-[11px] text-stone-600">
                Total Amount = Package Price + Add-ons
              </div>
            </div>
          )}

          <form
            onSubmit={handleBook}
            className="mt-3 space-y-3"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={fieldClass}
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
                className={fieldClass}
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
              className={fieldClass}
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
              className={fieldClass}
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
                className={fieldClass}
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
                className={fieldClass}
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
              className={fieldClass}
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
              className={fieldClass}
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

            <textarea
              className={fieldClass}
              rows={3}
              placeholder="Special requirements (optional)"
              value={form.specialNotes}
              onChange={(e) =>
                setForm({
                  ...form,
                  specialNotes: e.target.value,
                })
              }
            />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {!isBengaliVivahEnquiryOnly && (
                <select
                  className={fieldClass}
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
              )}

              <button className={`w-full rounded-xl py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition disabled:opacity-60 disabled:cursor-not-allowed ${
                isBengaliVivahEnquiryOnly
                  ? 'bg-red-600 hover:bg-red-700 sm:col-span-2'
                  : 'bg-stone-900 hover:bg-stone-800 sm:col-span-1'
              }`}>
                {isSubmitting
                  ? isBengaliVivahEnquiryOnly
                    ? 'Sending Enquiry...'
                    : 'Booking...'
                  : isBengaliVivahEnquiryOnly
                    ? 'Send Enquiry & Get Quote'
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