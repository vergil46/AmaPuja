import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import api from '../services/api'
import { DashboardSkeleton } from '../components/LoadingSkeleton'
import { useAuth } from '../context/useAuth'

const compressImageToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const maxDimension = 800
        const ratio = Math.min(maxDimension / image.width, maxDimension / image.height, 1)
        const width = Math.max(1, Math.round(image.width * ratio))
        const height = Math.max(1, Math.round(image.height * ratio))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Image processing failed'))
          return
        }

        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }

      image.onerror = () => reject(new Error('Invalid image file'))
      image.src = reader.result
    }

    reader.onerror = () => reject(new Error('Unable to read image file'))
    reader.readAsDataURL(file)
  })

function DashboardPage() {
  const { token } = useAuth()
  const isLoggedIn = Boolean(token)
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackForm, setFeedbackForm] = useState({})
  const [feedbackSubmittingById, setFeedbackSubmittingById] = useState({})
  const [feedbackPhotoProcessingById, setFeedbackPhotoProcessingById] = useState({})
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' })
  const [trackForm, setTrackForm] = useState({ email: '', phone: '' })
  const [trackError, setTrackError] = useState('')
  const [tracking, setTracking] = useState(false)
  const [hasTracked, setHasTracked] = useState(false)
  const [cancelLoadingById, setCancelLoadingById] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      setBookings([])
      setFeedbacks([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    Promise.allSettled([api.get('/bookings/my'), api.get('/feedback/my')])
      .then(([bookingResult, feedbackResult]) => {
        if (bookingResult.status === 'fulfilled') {
          setBookings(Array.isArray(bookingResult.value?.data) ? bookingResult.value.data : [])
        } else {
          setBookings([])
        }

        if (feedbackResult.status === 'fulfilled') {
          setFeedbacks(Array.isArray(feedbackResult.value?.data) ? feedbackResult.value.data : [])
        } else {
          setFeedbacks([])
        }
      })
      .finally(() => setIsLoading(false))
  }, [isLoggedIn])

  const feedbackByBookingId = Object.fromEntries(feedbacks.map((item) => [item.bookingId, item]))

  const normalizeBookingStatus = (status) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized === 'confirmed' || normalized === 'completed' || normalized === 'cancelled') {
      return normalized
    }
    return 'pending'
  }

  const getStatusLabel = (status) => {
    const normalized = normalizeBookingStatus(status)
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const getTimelineStepClass = (step, status) => {
    const normalized = normalizeBookingStatus(status)

    if (normalized === 'cancelled') {
      return 'bg-red-100 text-red-700 border-red-200'
    }

    if (step === 'requested') {
      return 'bg-orange-100 text-orange-800 border-orange-200'
    }

    if (step === 'confirmed') {
      return ['confirmed', 'completed'].includes(normalized)
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : 'bg-stone-100 text-stone-500 border-stone-200'
    }

    if (step === 'completed') {
      return normalized === 'completed'
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-stone-100 text-stone-500 border-stone-200'
    }

    return 'bg-stone-100 text-stone-500 border-stone-200'
  }

  const completedBookingsWithoutFeedback = bookings.filter(
    (booking) => normalizeBookingStatus(booking.bookingStatus) === 'completed' && !feedbackByBookingId[booking._id]
  )

  const reviewBookingId = new URLSearchParams(location.search).get('reviewBooking')

  useEffect(() => {
    if (isLoading || !reviewBookingId) return

    const target = document.getElementById(`feedback-booking-${reviewBookingId}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      const section = document.getElementById('feedback')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [isLoading, reviewBookingId])

  const handleFeedbackChange = (bookingId, field, value) => {
    setFeedbackForm((prev) => ({
      ...prev,
      [bookingId]: {
        rating: prev[bookingId]?.rating || 5,
        comment: prev[bookingId]?.comment || '',
        reviewPhoto: prev[bookingId]?.reviewPhoto || '',
        [field]: value,
      },
    }))
  }

  const handleFeedbackPhotoChange = async (bookingId, file) => {
    if (!file) {
      handleFeedbackChange(bookingId, 'reviewPhoto', '')
      return
    }

    if (!file.type.startsWith('image/')) {
      setFeedbackMessage({ type: 'error', text: 'Please select a valid image file.' })
      return
    }

    setFeedbackPhotoProcessingById((prev) => ({ ...prev, [bookingId]: true }))

    try {
      const compressedImage = await compressImageToDataUrl(file)
      handleFeedbackChange(bookingId, 'reviewPhoto', compressedImage)
      setFeedbackMessage({ type: '', text: '' })
    } catch (error) {
      setFeedbackMessage({ type: 'error', text: error.message || 'Unable to process review photo.' })
    } finally {
      setFeedbackPhotoProcessingById((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const submitFeedback = async (bookingId) => {
    if (feedbackSubmittingById[bookingId]) return

    const payload = feedbackForm[bookingId] || { rating: 5, comment: '', reviewPhoto: '' }
    if (!payload.comment?.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Please write a comment before submitting feedback.' })
      return
    }

    setFeedbackSubmittingById((prev) => ({ ...prev, [bookingId]: true }))

    try {
      const res = await api.post('/feedback', {
        bookingId,
        rating: Number(payload.rating || 5),
        comment: payload.comment,
        reviewPhoto: payload.reviewPhoto || '',
      })

      setFeedbacks((prev) => [res.data, ...prev.filter((item) => item.bookingId !== bookingId)])
      setFeedbackForm((prev) => ({ ...prev, [bookingId]: { rating: 5, comment: '', reviewPhoto: '' } }))
      setFeedbackMessage({ type: 'success', text: 'Thank you! Your feedback has been submitted and is pending approval.' })
    } catch (error) {
      setFeedbackMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Unable to submit feedback right now. Please try again.',
      })
    } finally {
      setFeedbackSubmittingById((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!isLoggedIn) return

    setFeedbackMessage({ type: '', text: '' })
    setCancelLoadingById((prev) => ({ ...prev, [bookingId]: true }))
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`)
      const updatedBooking = response.data
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId
            ? { ...booking, bookingStatus: updatedBooking.bookingStatus || 'cancelled' }
            : booking
        )
      )
      setFeedbackMessage({ type: 'success', text: 'Booking cancelled successfully.' })
    } catch (error) {
      setFeedbackMessage({ type: 'error', text: error?.response?.data?.message || 'Failed to cancel booking.' })
    } finally {
      setCancelLoadingById((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const handleGuestTrack = async (event) => {
    event.preventDefault()
    if (tracking) return

    setTrackError('')
    setFeedbackMessage({ type: '', text: '' })

    const email = String(trackForm.email || '').trim().toLowerCase()
    const phone = String(trackForm.phone || '').replace(/\D/g, '')

    if (!email || !phone || phone.length < 10) {
      setTrackError('Enter the same email and 10-digit phone number used at booking time.')
      return
    }

    setTracking(true)
    setHasTracked(true)

    try {
      const response = await api.post('/bookings/track', { email, phone })
      setBookings(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setBookings([])
      setTrackError(error?.response?.data?.message || 'Unable to track booking right now. Please try again.')
    } finally {
      setTracking(false)
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => normalizeBookingStatus(b.bookingStatus) === 'pending').length,
    confirmed: bookings.filter(b => normalizeBookingStatus(b.bookingStatus) === 'confirmed').length,
    completed: bookings.filter(b => normalizeBookingStatus(b.bookingStatus) === 'completed').length,
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[normalizeBookingStatus(status)] || 'bg-stone-100 text-stone-800 border-stone-200'
  }

  const getPaymentColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-stone-100 text-stone-800'
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title="Dashboard | Puja Samriddhi" description="View your bookings and statuses on Puja Samriddhi." />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">{isLoggedIn ? 'My Dashboard' : 'Track Booking Status'}</h1>
          <p className="text-stone-600 mt-1">
            {isLoggedIn
              ? 'Manage your bookings and feedback'
              : 'Login is optional. Track your booking with email and phone.'}
          </p>
        </div>
      </div>

      {!isLoggedIn && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#FFE0A3]/80 bg-linear-to-br from-[#FFF8E1] via-[#FFF3C4] to-white shadow-sm">
          <div className="border-b border-[#FFE0A3]/70 bg-white/70 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6F00]">Guest Access</p>
            <h2 className="mt-1 text-lg font-semibold text-[#333333] sm:text-xl">Track Your Booking Instantly</h2>
            <p className="mt-1 text-sm text-[#333333]/78">Use the same contact details used during booking. No login required.</p>
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]" onSubmit={handleGuestTrack}>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-[#333333]/75">Booking Email</span>
                <input
                  type="email"
                  className="w-full rounded-xl border border-[#FFE0A3] bg-white px-3 py-2.5 text-sm text-[#333333] outline-none transition focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                  placeholder="you@example.com"
                  value={trackForm.email}
                  onChange={(event) => setTrackForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-[#333333]/75">Booking Phone</span>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-[#FFE0A3] bg-white px-3 py-2.5 text-sm text-[#333333] outline-none transition focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20"
                  placeholder="10-digit number"
                  value={trackForm.phone}
                  onChange={(event) => setTrackForm((prev) => ({ ...prev, phone: event.target.value }))}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={tracking}
                className="self-end rounded-xl bg-linear-to-r from-[#D84315] via-[#FF6F00] to-[#FF8F00] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
              >
                {tracking ? 'Tracking...' : 'Track Status'}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-600">
              <span className="rounded-full border border-[#FFE0A3] bg-white px-2.5 py-1">Private lookup</span>
              <span className="rounded-full border border-[#FFE0A3] bg-white px-2.5 py-1">Real-time status</span>
              <span className="rounded-full border border-[#FFE0A3] bg-white px-2.5 py-1">No account required</span>
            </div>

            {trackError && <p className="mt-3 text-sm font-medium text-red-700">{trackError}</p>}
            {!trackError && hasTracked && bookings.length === 0 && (
              <p className="mt-3 text-sm font-medium text-stone-700">No bookings found for the provided details.</p>
            )}

            <p className="mt-4 text-sm text-stone-600">
              Want cancellation and feedback options?
              <Link to="/login" className="ml-1 font-semibold text-[#FF6F00] hover:text-[#D84315]">
                Login to your dashboard
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {isLoggedIn && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#FFE0A3] rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#333333]/70">Total Bookings</p>
              <p className="text-3xl font-bold text-[#333333] mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-[#FFF0C2] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#FFE0A3] rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#333333]/70">Pending</p>
              <p className="text-3xl font-bold text-[#D84315] mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-[#FFF0C2] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#D84315]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#FFE0A3] rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#333333]/70">Confirmed</p>
              <p className="text-3xl font-bold text-[#FF6F00] mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-[#FFF8E1] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#FFE0A3] rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#333333]/70">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Bookings Table */}
      <div id="bookings" className="bg-white border border-[#FFE0A3] rounded-xl overflow-hidden mb-8 scroll-mt-28">
        <div
          className={`px-6 py-4 border-b ${
            isLoggedIn
              ? 'bg-stone-50 border-stone-200'
              : 'bg-linear-to-r from-amber-50 via-orange-50 to-white border-orange-200/80'
          }`}
        >
          <h2 className="text-lg font-semibold text-stone-800">
            {isLoggedIn ? 'Recent Bookings' : 'Tracking Results'}
          </h2>
          {!isLoggedIn && (
            <p className="mt-1 text-xs font-medium text-stone-600">
              {hasTracked ? 'Showing bookings matched with your email and phone.' : 'Run a lookup above to see your booking timeline.'}
            </p>
          )}
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-stone-600">{isLoggedIn ? 'No bookings yet' : hasTracked ? 'No booking matched' : 'No lookup yet'}</p>
            <p className="text-sm text-stone-500 mt-1">
              {isLoggedIn
                ? 'Start by booking a puja service'
                : hasTracked
                  ? 'Please verify email and phone entered above.'
                  : 'Enter booking email and phone above to track status.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-stone-700">Puja</th>
                  <th className="px-6 py-3 text-left font-semibold text-stone-700">Date & Time</th>
                  <th className="px-6 py-3 text-left font-semibold text-stone-700">Package</th>
                  <th className="px-6 py-3 text-left font-semibold text-stone-700">Payment</th>
                  <th className="px-6 py-3 text-left font-semibold text-stone-700">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#333333]/75">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-[#FFF8E1] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#333333]">{booking.poojaId?.title}</p>
                      <p className="text-xs text-stone-500 mt-1">{booking.city}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-stone-700">{booking.date}</p>
                      <p className="text-xs text-stone-500">{booking.time}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-700">{booking.package}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPaymentColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 min-w-57.5">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.bookingStatus)}`}>
                          {getStatusLabel(booking.bookingStatus)}
                        </span>
                        {normalizeBookingStatus(booking.bookingStatus) === 'cancelled' ? (
                          <p className="text-xs text-red-600">Timeline stopped: booking cancelled</p>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className={`px-2 py-0.5 rounded-full border ${getTimelineStepClass('requested', booking.bookingStatus)}`}>
                              Requested
                            </span>
                            <span className="text-stone-400">→</span>
                            <span className={`px-2 py-0.5 rounded-full border ${getTimelineStepClass('confirmed', booking.bookingStatus)}`}>
                              Confirmed
                            </span>
                            <span className="text-stone-400">→</span>
                            <span className={`px-2 py-0.5 rounded-full border ${getTimelineStepClass('completed', booking.bookingStatus)}`}>
                              Completed
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isLoggedIn && ['pending', 'confirmed'].includes(normalizeBookingStatus(booking.bookingStatus)) ? (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={Boolean(cancelLoadingById[booking._id])}
                          className="px-3 py-1.5 text-xs rounded-md bg-[#D84315] text-white hover:bg-[#C63B12] disabled:opacity-60"
                        >
                          {cancelLoadingById[booking._id] ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      {isLoggedIn && (
      <div id="feedback" className="bg-white border border-[#FFE0A3] rounded-xl p-6 scroll-mt-28">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FFF0C2] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#333333]">Share Your Experience</h2>
            <p className="text-sm text-stone-600">Help us improve by sharing feedback for completed poojas</p>
          </div>
        </div>
        
        {feedbackMessage.text && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm border ${
              feedbackMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}

        {completedBookingsWithoutFeedback.length === 0 ? (
          <p className="mt-4 text-sm text-stone-600">No completed booking pending feedback.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {completedBookingsWithoutFeedback.map((booking) => (
              <div
                id={`feedback-booking-${booking._id}`}
                key={booking._id}
                className={`border rounded-lg p-4 ${
                  reviewBookingId === booking._id ? 'border-[#FF6F00] ring-2 ring-[#FF6F00]/15' : 'border-stone-200'
                }`}
              >
                <p className="font-medium text-[#333333]">{booking.poojaId?.title}</p>
                <p className="text-sm text-stone-600 mt-1">{booking.date} {booking.time}</p>

                <div className="mt-3 grid sm:grid-cols-[160px_1fr] gap-3">
                  <select
                    className="w-full px-3 py-2 rounded border border-stone-300"
                    value={feedbackForm[booking._id]?.rating || 5}
                    onChange={(e) => handleFeedbackChange(booking._id, 'rating', e.target.value)}
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Good</option>
                    <option value={2}>2 - Average</option>
                    <option value={1}>1 - Poor</option>
                  </select>

                  <textarea
                    className="w-full px-3 py-2 rounded border border-stone-300"
                    rows={3}
                    placeholder="Write your feedback"
                    value={feedbackForm[booking._id]?.comment || ''}
                    onChange={(e) => handleFeedbackChange(booking._id, 'comment', e.target.value)}
                  />
                </div>

                <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
                  <label className="block text-sm font-medium text-stone-700">Add Photo (optional)</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="mt-2 block w-full text-sm text-stone-700 file:mr-3 file:rounded file:border-0 file:bg-orange-100 file:px-3 file:py-1.5 file:font-medium file:text-orange-800"
                    onChange={(e) => handleFeedbackPhotoChange(booking._id, e.target.files?.[0])}
                  />
                  {feedbackPhotoProcessingById[booking._id] ? (
                    <p className="mt-2 text-xs text-stone-500">Optimizing photo...</p>
                  ) : null}
                  {feedbackForm[booking._id]?.reviewPhoto ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={feedbackForm[booking._id].reviewPhoto}
                        alt="Review preview"
                        className="h-14 w-14 rounded-lg border border-stone-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleFeedbackChange(booking._id, 'reviewPhoto', '')}
                        className="text-xs font-medium text-[#D84315] hover:text-[#B63A12]"
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => submitFeedback(booking._id)}
                  disabled={Boolean(feedbackSubmittingById[booking._id]) || Boolean(feedbackPhotoProcessingById[booking._id])}
                  className="mt-3 px-4 py-2 rounded bg-linear-to-r from-[#D84315] to-[#FF6F00] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {feedbackSubmittingById[booking._id] ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </section>
  )
}

export default DashboardPage

