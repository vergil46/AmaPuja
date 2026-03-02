import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import Testimonials from '../components/Testimonials'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const RATING_OPTIONS = [
  { value: 5, label: '5 - Excellent' },
  { value: 4, label: '4 - Very Good' },
  { value: 3, label: '3 - Good' },
  { value: 2, label: '2 - Average' },
  { value: 1, label: '1 - Poor' },
]

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-amber-500' : 'text-stone-300'}>
          ★
        </span>
      ))}
    </div>
  )
}

function RatingsPage() {
  const location = useLocation()
  const { token } = useAuth()
  const [bookings, setBookings] = useState(() => (token ? null : []))
  const [feedbacks, setFeedbacks] = useState([])
  const [publicFeedbacks, setPublicFeedbacks] = useState(null)
  const [feedbackForm, setFeedbackForm] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    api
      .get('/feedback?limit=60')
      .then((response) => setPublicFeedbacks(response.data || []))
      .catch(() => setPublicFeedbacks([]))
  }, [])

  useEffect(() => {
    if (!token) return

    Promise.all([api.get('/bookings/my'), api.get('/feedback/my')])
      .then(([bookingRes, feedbackRes]) => {
        setBookings(bookingRes.data)
        setFeedbacks(feedbackRes.data)
      })
      .catch(() => {
        setBookings([])
        setFeedbacks([])
      })
  }, [token])

  const isLoading = token && bookings === null

  const reviewBookingId = useMemo(
    () => new URLSearchParams(location.search).get('reviewBooking'),
    [location.search]
  )

  useEffect(() => {
    if (!reviewBookingId || isLoading) return

    const target = document.getElementById(`rating-booking-${reviewBookingId}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [reviewBookingId, isLoading])

  const feedbackByBookingId = useMemo(
    () => Object.fromEntries(feedbacks.map((item) => [item.bookingId, item])),
    [feedbacks]
  )

  const completedBookingsWithoutFeedback = useMemo(
    () =>
      (bookings || []).filter(
        (booking) => booking.bookingStatus === 'completed' && !feedbackByBookingId[booking._id]
      ),
    [bookings, feedbackByBookingId]
  )

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
      setMessage('Please write a comment before submitting.')
      return
    }

    const response = await api.post('/feedback', {
      bookingId,
      rating: Number(payload.rating || 5),
      comment: payload.comment,
    })

    setFeedbacks((prev) => [response.data, ...prev.filter((item) => item.bookingId !== bookingId)])
    setFeedbackForm((prev) => ({ ...prev, [bookingId]: { rating: 5, comment: '' } }))
    setPublicFeedbacks((prev) => [
      {
        _id: response.data._id,
        rating: response.data.rating,
        comment: response.data.comment,
        createdAt: response.data.createdAt,
        customerName: 'You',
        poojaTitle: response.data.poojaId?.title || 'Pooja Service',
      },
      ...prev,
    ])
    setMessage('Thank you! Your review was submitted successfully.')
  }

  const feedbackCount = publicFeedbacks?.length || 0

  const averageRating = feedbackCount
    ? (publicFeedbacks.reduce((sum, feedback) => sum + Number(feedback.rating || 0), 0) / feedbackCount).toFixed(1)
    : '0.0'

  return (
    <section className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <Seo title="Ratings & Reviews | PujaSamrddhi" description="Share feedback for your completed pooja bookings." />

      <div className="rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-stone-800">Ratings & Reviews</h1>
        <p className="text-stone-600 mt-2">
          Share your experience and help us improve our puja service quality.
        </p>
      </div>

      {!token ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-800">Login required to submit a review</h2>
          <p className="text-stone-600 mt-2">
            You can add a rating after completing a booking from your account dashboard.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 text-white text-sm font-medium"
            >
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium">
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-stone-800">Pending reviews</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                {completedBookingsWithoutFeedback.length} pending
              </span>
            </div>

            {isLoading ? (
              <p className="mt-4 text-sm text-stone-500">Loading your bookings...</p>
            ) : completedBookingsWithoutFeedback.length === 0 ? (
              <p className="mt-4 text-sm text-stone-600">No completed booking pending feedback.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {completedBookingsWithoutFeedback.map((booking) => (
                  <div
                    id={`rating-booking-${booking._id}`}
                    key={booking._id}
                    className={`rounded-xl border p-4 ${
                      reviewBookingId === booking._id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-stone-200'
                    }`}
                  >
                    <p className="font-medium text-stone-800">{booking.poojaId?.title}</p>
                    <p className="text-sm text-stone-600 mt-1">
                      {booking.date} • {booking.time}
                    </p>

                    <div className="mt-3 grid sm:grid-cols-[180px_1fr] gap-3">
                      <select
                        className="w-full px-3 py-2 rounded-lg border border-stone-300"
                        value={feedbackForm[booking._id]?.rating || 5}
                        onChange={(event) => handleFeedbackChange(booking._id, 'rating', event.target.value)}
                      >
                        {RATING_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-stone-300"
                        rows={3}
                        placeholder="Write your review"
                        value={feedbackForm[booking._id]?.comment || ''}
                        onChange={(event) => handleFeedbackChange(booking._id, 'comment', event.target.value)}
                      />
                    </div>

                    <button
                      onClick={() => submitFeedback(booking._id)}
                      className="mt-3 px-4 py-2 rounded-lg bg-orange-700 text-white text-sm font-medium"
                    >
                      Submit review
                    </button>
                  </div>
                ))}
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 text-green-800 text-sm px-3 py-2">
                {message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-800">My submitted reviews</h2>
            {feedbacks.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">You have not submitted any review yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {feedbacks.map((feedback) => (
                  <article key={feedback._id} className="rounded-xl border border-stone-200 p-4 bg-stone-50/70">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-stone-800">{feedback.poojaId?.title || 'Pooja Service'}</p>
                      <StarRow rating={feedback.rating} />
                    </div>
                    <p className="mt-2 text-sm text-stone-700">{feedback.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-stone-800">Customer reviews</h2>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <StarRow rating={Math.round(Number(averageRating))} />
            <span>{averageRating} / 5</span>
            <span className="text-stone-500">({feedbackCount} reviews)</span>
          </div>
        </div>

        {publicFeedbacks === null ? (
          <p className="mt-3 text-sm text-stone-500">Loading customer reviews...</p>
        ) : publicFeedbacks.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No customer reviews available yet.</p>
        ) : (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {publicFeedbacks.map((feedback) => (
              <article key={feedback._id} className="rounded-xl border border-orange-100 bg-orange-50/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-800">{feedback.customerName}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{feedback.poojaTitle}</p>
                  </div>
                  <StarRow rating={feedback.rating} />
                </div>
                <p className="mt-3 text-sm text-stone-700">{feedback.comment}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <Testimonials />
    </section>
  )
}

export default RatingsPage
