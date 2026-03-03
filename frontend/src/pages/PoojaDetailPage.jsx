import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getPoojaImage } from '../assets/poojaImageMap'
import Seo from '../components/Seo'
import api from '../services/api'
import { PoojaDetailSkeleton } from '../components/LoadingSkeleton'

const FUNNEL_SESSION_KEY = 'pujasamrddhi_funnel_session'

const getFunnelSessionId = () => {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem(FUNNEL_SESSION_KEY)
  if (existing) return existing

  const generated = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(FUNNEL_SESSION_KEY, generated)
  return generated
}

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
  const [isFetchingLocation, setIsFetchingLocation] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const bookingPanelRef = useRef(null)
  const formStartedRef = useRef(false)

  const draftStorageKey = `pooja-booking-draft-${id || 'default'}`

  const trackFunnelEvent = useCallback(async (eventName, metadata = {}) => {
    try {
      await api.post('/analytics/track', {
        eventName,
        sessionId: getFunnelSessionId(),
        route: typeof window !== 'undefined' ? window.location.pathname : '',
        poojaId: id,
        metadata,
      })
    } catch (error) {
      console.warn('Funnel tracking failed:', error?.message || error)
    }
  }, [id])

  const scrollToBookingForm = () => {
    bookingPanelRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

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
    state: '',
    pincode: '',
    house: '',
    street: '',
    priestPreference:
      selectedLanguageFromServices,
    date: '',
    time: '',
    address: '',
    latitude: '',
    longitude: '',
    specialNotes: '',
    paymentOption: 'full',
  })

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const buildAddressFromParts = (values) => {
    return [
      values.house,
      values.street,
      values.city,
      values.state,
      values.pincode,
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .join(', ')
  }

  const parseGoogleAddress = (geocodeResult) => {
    const components = Array.isArray(geocodeResult?.address_components)
      ? geocodeResult.address_components
      : []

    const readComponent = (types) => {
      const found = components.find((component) =>
        Array.isArray(component.types) &&
        types.every((type) => component.types.includes(type))
      )
      return found?.long_name || ''
    }

    const streetNumber = readComponent(['street_number'])
    const route = readComponent(['route'])
    const locality =
      readComponent(['locality', 'political']) ||
      readComponent(['sublocality_level_1', 'sublocality', 'political']) ||
      readComponent(['administrative_area_level_2', 'political'])
    const state = readComponent(['administrative_area_level_1', 'political'])
    const postalCode = readComponent(['postal_code'])

    return {
      house: streetNumber,
      street: route,
      city: locality,
      state,
      pincode: postalCode,
      formattedAddress: String(geocodeResult?.formatted_address || '').trim(),
    }
  }

  const parseFallbackAddress = (payload) => {
    const address = payload?.localityInfo?.administrative || {}

    const city =
      String(payload?.city || '').trim() ||
      String(payload?.locality || '').trim() ||
      String(payload?.principalSubdivision || '').trim() ||
      String(address?.city || '').trim()

    const state =
      String(payload?.principalSubdivision || '').trim() ||
      String(address?.principalSubdivision || '').trim() ||
      String(address?.state || '').trim()

    return {
      house: '',
      street: String(payload?.locality || '').trim(),
      city,
      state,
      pincode: String(payload?.postcode || '').trim(),
      formattedAddress: String(payload?.locality || '').trim(),
    }
  }

  const fetchAddressFromFallback = async (
    latitude,
    longitude
  ) => {
    const fallbackUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    const fallbackResponse = await fetch(fallbackUrl)

    if (!fallbackResponse.ok) {
      throw new Error('Unable to fetch address from location coordinates.')
    }

    const fallbackPayload = await fallbackResponse.json()
    const parsedFallbackAddress = parseFallbackAddress(
      fallbackPayload
    )

    if (
      !parsedFallbackAddress.formattedAddress &&
      !parsedFallbackAddress.city &&
      !parsedFallbackAddress.state
    ) {
      throw new Error('No address found for your current location.')
    }

    return parsedFallbackAddress
  }

  const fetchAddressFromCoordinates = async (
    latitude,
    longitude
  ) => {
    if (googleMapsApiKey) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Unable to fetch address from location coordinates.')
      }

      const payload = await response.json()
      if (
        payload.status === 'OK' &&
        Array.isArray(payload.results) &&
        payload.results.length > 0
      ) {
        return parseGoogleAddress(payload.results[0])
      }
    }

    return fetchAddressFromFallback(latitude, longitude)
  }

  const handleUseCurrentLocation = async () => {
    setLocationMessage('')
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.')
      return
    }

    setIsFetchingLocation(true)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })

      const latitude = Number(position.coords.latitude)
      const longitude = Number(position.coords.longitude)

      const parsedAddress = await fetchAddressFromCoordinates(
        latitude,
        longitude
      )

      setForm((previous) => {
        const merged = {
          ...previous,
          house: parsedAddress.house || previous.house,
          street: parsedAddress.street || previous.street,
          city: parsedAddress.city || previous.city,
          state: parsedAddress.state || previous.state,
          pincode: parsedAddress.pincode || previous.pincode,
          latitude: String(latitude),
          longitude: String(longitude),
        }

        const autoAddress =
          parsedAddress.formattedAddress ||
          buildAddressFromParts(merged)

        return {
          ...merged,
          address: autoAddress || previous.address,
        }
      })

      setLocationMessage('Location fetched and address auto-filled successfully.')
    } catch (error) {
      if (error?.code === 1) {
        setLocationMessage('Location permission denied. Please enter address manually.')
      } else if (error?.code === 2) {
        setLocationMessage('Location unavailable. Please enter address manually.')
      } else if (error?.code === 3) {
        setLocationMessage('Location request timed out. Please try again or enter address manually.')
      } else {
        setLocationMessage(error?.message || 'Failed to fetch location. Please enter address manually.')
      }
    } finally {
      setIsFetchingLocation(false)
    }
  }

  useEffect(() => {
    api.get(`/poojas/${id}`).then((res) => {
      setPooja(res.data)
      setSelectedPackage('')
      setSelectedAddOns([])
    })
  }, [id])

  useEffect(() => {
    if (!id) return
    trackFunnelEvent('service_view', { source: 'pooja_detail' })
  }, [id, trackFunnelEvent])

  useEffect(() => {
    if (!id || typeof window === 'undefined') return
    const raw = localStorage.getItem(draftStorageKey)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return

      setForm((previous) => ({
        ...previous,
        ...Object.fromEntries(
          Object.entries(parsed).filter(([, value]) => typeof value === 'string')
        ),
      }))

      if (Array.isArray(parsed.selectedAddOns)) {
        setSelectedAddOns(parsed.selectedAddOns.filter(Boolean))
      }
      if (typeof parsed.selectedPackage === 'string' && parsed.selectedPackage.trim()) {
        setSelectedPackage(parsed.selectedPackage.trim())
      }
    } catch (error) {
      console.warn('Failed to load booking draft:', error)
    }
  }, [id, draftStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !id) return
    const draftPayload = {
      ...form,
      selectedPackage,
      selectedAddOns,
    }
    localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload))
  }, [form, selectedPackage, selectedAddOns, draftStorageKey, id])

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

  const normalizedPhone = String(form.phone || '').replace(/\D/g, '')
  const hasValidPhone = normalizedPhone.length >= 10
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email || '').trim())
  const enquiryFlowTitle =
    activeLanguagePricing?.title ||
    pooja?.localizedTitle?.[
      activeLanguageKey
    ] ||
    pooja?.title ||
    ''
  const isBengaliVivahEnquiryOnly =
    activeLanguageKey === 'bengali' &&
    /vivah/i.test(String(enquiryFlowTitle || ''))

  const quickValidationMessage = useMemo(() => {
    if (form.phone && !hasValidPhone) return 'Enter a valid 10-digit phone number.'
    if (form.email && !hasValidEmail) return 'Enter a valid email address.'
    if (!isBengaliVivahEnquiryOnly && form.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selected = new Date(form.date)
      if (!Number.isNaN(selected.getTime()) && selected < today) {
        return 'Please choose today or a future date.'
      }
    }
    return ''
  }, [form.phone, form.email, form.date, hasValidPhone, hasValidEmail, isBengaliVivahEnquiryOnly])

  const isPrimaryFormValid = hasValidPhone && hasValidEmail && !quickValidationMessage

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

    if (!isPrimaryFormValid) {
      setBookingMessage(quickValidationMessage || 'Please correct highlighted fields before continuing.')
      return
    }

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
        trackFunnelEvent('booking_submitted', { flow: 'enquiry_only' })
        const enquiryLines = [
          `Priest Preference: ${form.priestPreference}`,
          `City: ${form.city}`,
          form.date
            ? `Preferred Date: ${form.date}`
            : '',
          form.time
            ? `Preferred Time: ${form.time}`
            : '',
            `Address: ${form.address || buildAddressFromParts(form)}`,
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

      const computedAddress =
        String(form.address || '').trim() ||
        buildAddressFromParts(form)

      const bookingRes = await api.post('/bookings', {
        poojaId: id,
        package: selectedPackage,
        selectedAddOns,
        addressDetails: {
          house: form.house,
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          formattedAddress: computedAddress,
        },
        coordinates: {
          latitude: Number(form.latitude || 0) || null,
          longitude: Number(form.longitude || 0) || null,
        },
        ...form,
        address: computedAddress,
      })

      const booking = bookingRes.data
      trackFunnelEvent('booking_submitted', {
        flow: form.paymentOption,
        selectedPackage,
        payableAmount,
      })

      if (form.paymentOption === 'pay-after-pooja') {
        setBookingMessage('Booking placed successfully.')
        trackFunnelEvent('payment_success', { flow: 'pay-after-pooja' })
        if (typeof window !== 'undefined') {
          localStorage.removeItem(draftStorageKey)
        }
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
          trackFunnelEvent('payment_success', { flow: form.paymentOption })
          if (typeof window !== 'undefined') {
            localStorage.removeItem(draftStorageKey)
          }
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
    enquiryFlowTitle || pooja?.title

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
              loading="eager"
              fetchpriority="high"
              decoding="async"
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

        <div ref={bookingPanelRef} className="rounded-3xl border border-stone-300 bg-stone-100/95 p-4 sm:p-5 shadow-md lg:sticky lg:top-24">
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

          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs sm:text-sm text-emerald-800">
            Verified Priests • 1000+ Rituals Completed • Secure Payment
          </div>

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
            onFocus={() => {
              if (!formStartedRef.current) {
                formStartedRef.current = true
                trackFunnelEvent('form_started', { source: 'booking_form' })
              }
            }}
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

            {quickValidationMessage && (
              <p className="text-xs text-red-600">{quickValidationMessage}</p>
            )}

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

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isFetchingLocation}
              className="w-full rounded-xl border border-orange-300 bg-orange-50 px-3.5 py-2.5 text-sm font-semibold text-orange-800 transition hover:bg-orange-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isFetchingLocation
                ? 'Fetching your location...'
                : 'Use My Current Location'}
            </button>

            {locationMessage && (
              <p className={`text-xs ${locationMessage.toLowerCase().includes('successfully') ? 'text-green-700' : 'text-red-600'}`}>
                {locationMessage}
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={fieldClass}
                placeholder="House / Flat No. *"
                required
                value={form.house}
                onChange={(e) =>
                  setForm({
                    ...form,
                    house: e.target.value,
                  })
                }
              />

              <input
                className={fieldClass}
                placeholder="Street / Area *"
                required
                value={form.street}
                onChange={(e) =>
                  setForm({
                    ...form,
                    street: e.target.value,
                  })
                }
              />

              <input
                className={fieldClass}
                placeholder="City *"
                required
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
              />

              <input
                className={fieldClass}
                placeholder="State *"
                required
                value={form.state}
                onChange={(e) =>
                  setForm({
                    ...form,
                    state: e.target.value,
                  })
                }
              />

              <input
                className={fieldClass}
                placeholder="Pincode *"
                required
                value={form.pincode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pincode: e.target.value,
                  })
                }
              />
            </div>

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
              placeholder="Full Address *"
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
              }`} disabled={isSubmitting || !isPrimaryFormValid}>
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

      <button
        type="button"
        onClick={scrollToBookingForm}
        className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-sm rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-stone-900/30 transition hover:bg-stone-800"
      >
        {isBengaliVivahEnquiryOnly
          ? 'Send Enquiry'
          : `Book Now • ₹${payableAmount}`}
      </button>
    </section>
  )
}

export default PoojaDetailPage