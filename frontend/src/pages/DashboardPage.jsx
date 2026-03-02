import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import api from '../services/api'
import { DashboardSkeleton } from '../components/LoadingSkeleton'

function DashboardPage() {
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackForm, setFeedbackForm] = useState({})
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [cancelLoadingById, setCancelLoadingById] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
  }, [])

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
        [field]: value,
      },
    }))
  }

  const submitFeedback = async (bookingId) => {
    const payload = feedbackForm[bookingId] || { rating: 5, comment: '' }
    if (!payload.comment?.trim()) {
      setFeedbackMessage('Please write a comment before submitting feedback.')
      return
    }

    const res = await api.post('/feedback', {
      bookingId,
      rating: Number(payload.rating || 5),
      comment: payload.comment,
    })

    setFeedbacks((prev) => [res.data, ...prev.filter((item) => item.bookingId !== bookingId)])
    setFeedbackMessage('Thank you! Your feedback has been submitted.')
  }

  const handleCancelBooking = async (bookingId) => {
    setFeedbackMessage('')
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
      setFeedbackMessage('Booking cancelled successfully.')
    } catch (error) {
      setFeedbackMessage(error?.response?.data?.message || 'Failed to cancel booking.')
    } finally {
      setCancelLoadingById((prev) => ({ ...prev, [bookingId]: false }))
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
      <Seo title="Dashboard | PujaSamrddhi" description="View your bookings and statuses on PujaSamrddhi." />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">My Dashboard</h1>
          <p className="text-stone-600 mt-1">Manage your bookings and feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Total Bookings</p>
              <p className="text-3xl font-bold text-stone-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-600">Completed</p>
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

      {/* Bookings Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-8">
        <div className="bg-stone-50 px-6 py-4 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800">Recent Bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-stone-600">No bookings yet</p>
            <p className="text-sm text-stone-500 mt-1">Start by booking a puja service</p>
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
                  <th className="px-6 py-3 text-left font-semibold text-stone-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-800">{booking.poojaId?.title}</p>
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
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.bookingStatus)}`}>
                        {getStatusLabel(booking.bookingStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {['pending', 'confirmed'].includes(normalizeBookingStatus(booking.bookingStatus)) ? (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={Boolean(cancelLoadingById[booking._id])}
                          className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
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
      <div id="feedback" className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-stone-800">Share Your Experience</h2>
            <p className="text-sm text-stone-600">Help us improve by sharing feedback for completed poojas</p>
          </div>
        </div>
        
        {feedbackMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
            {feedbackMessage}
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
                  reviewBookingId === booking._id ? 'border-orange-400 ring-2 ring-orange-200' : 'border-stone-200'
                }`}
              >
                <p className="font-medium text-stone-800">{booking.poojaId?.title}</p>
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

                <button
                  onClick={() => submitFeedback(booking._id)}
                  className="mt-3 px-4 py-2 rounded bg-orange-700 text-white"
                >
                  Submit Feedback
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default DashboardPage
