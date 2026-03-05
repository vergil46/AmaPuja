import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import Testimonials from '../components/Testimonials'
import { useAuth } from '../context/useAuth'
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
  const [submittingByBookingId, setSubmittingByBookingId] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })

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
    if (submittingByBookingId[bookingId]) return

    const payload = feedbackForm[bookingId] || { rating: 5, comment: '' }

    if (!payload.comment?.trim()) {
      setMessage({ type: 'error', text: 'Please write a comment before submitting.' })
      return
    }

    setSubmittingByBookingId((prev) => ({ ...prev, [bookingId]: true }))

    try {
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
        ...(prev || []),
      ])
      setMessage({ type: 'success', text: 'Thank you! Your review was submitted successfully.' })
    } catch (error) {
      const apiMessage = error?.response?.data?.message
      setMessage({ type: 'error', text: apiMessage || 'Unable to submit review right now. Please try again.' })
    } finally {
      setSubmittingByBookingId((prev) => ({ ...prev, [bookingId]: false }))
    }
  }

  const feedbackCount = publicFeedbacks?.length || 0

  const averageRating = feedbackCount
    ? (publicFeedbacks.reduce((sum, feedback) => sum + Number(feedback.rating || 0), 0) / feedbackCount).toFixed(1)
    : '0.0'

  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ;(publicFeedbacks || []).forEach((feedback) => {
      const rating = Number(feedback.rating || 0)
      if (counts[rating] !== undefined) {
        counts[rating] += 1
      }
    })

    return [5, 4, 3, 2, 1].map((rating) => {
      const count = counts[rating]
      const percent = feedbackCount ? Math.round((count / feedbackCount) * 100) : 0
      return { rating, count, percent }
    })
  }, [publicFeedbacks, feedbackCount])

  const inputClass =
    'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100'

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <Seo title="Ratings & Reviews | PujaSamrddhi" description="Share feedback for your completed pooja bookings." />

      <div className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm sm:p-7">
        <p className="text-xs font-medium uppercase tracking-widest text-orange-700">Customer Trust</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-800 sm:text-4xl">Ratings & Reviews</h1>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Share your experience and help us improve our puja service quality.
        </p>
      </div>

      {!token ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold text-stone-800 sm:text-2xl">Login required to submit a review</h2>
          <p className="mt-2 text-base leading-relaxed text-stone-600">
            You can add a rating after completing a booking from your account dashboard.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-linear-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Login
            </Link>
            <Link to="/signup" className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700">
              Create Account
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-stone-800 sm:text-2xl">📝 Pending reviews</h2>
              <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-sm text-orange-700">
                {completedBookingsWithoutFeedback.length} pending
              </span>
            </div>

            {isLoading ? (
              <p className="mt-4 text-sm text-stone-500">Loading your bookings...</p>
            ) : completedBookingsWithoutFeedback.length === 0 ? (
              <p className="mt-4 text-sm text-stone-600">No completed booking pending feedback.</p>
            ) : (
              <div className="mt-5 space-y-4">
                {completedBookingsWithoutFeedback.map((booking, index) => (
                  <div
                    id={`rating-booking-${booking._id}`}
                    key={booking._id}
                    className={`rounded-xl border p-4 animate-fade-up ${
                      reviewBookingId === booking._id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-stone-200'
                    }`}
                    style={{ animationDelay: `${Math.min(index * 0.06, 0.36)}s` }}
                  >
                    <p className="text-lg font-semibold text-stone-800">{booking.poojaId?.title}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {booking.date} • {booking.time}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[190px_1fr]">
                      <select
                        className={inputClass}
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
                        className={inputClass}
                        rows={3}
                        placeholder="Write your review"
                        value={feedbackForm[booking._id]?.comment || ''}
                        onChange={(event) => handleFeedbackChange(booking._id, 'comment', event.target.value)}
                      />
                    </div>

                    <button
                      onClick={() => submitFeedback(booking._id)}
                      disabled={Boolean(submittingByBookingId[booking._id])}
                      className="mt-3 rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingByBookingId[booking._id] ? 'Submitting...' : 'Submit review'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {message.text && (
              <div
                className={`mt-4 rounded-lg border text-sm px-3 py-2 ${
                  message.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-stone-800 sm:text-2xl">✅ My submitted reviews</h2>
            {feedbacks.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">You have not submitted any review yet.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {feedbacks.map((feedback, index) => (
                  <article
                    key={feedback._id}
                    className="rounded-xl border border-stone-200 p-4 bg-stone-50/70 animate-fade-up"
                    style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-stone-800">{feedback.poojaId?.title || 'Pooja Service'}</p>
                      <StarRow rating={feedback.rating} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-stone-700 sm:text-base">{feedback.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-stone-800 sm:text-2xl">🌟 Customer reviews</h2>
          <div className="flex items-center gap-2 text-sm text-stone-700">
            <StarRow rating={Math.round(Number(averageRating))} />
            <span>{averageRating} / 5</span>
            <span className="text-stone-500">({feedbackCount} reviews)</span>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-orange-100 bg-linear-to-r from-orange-50/70 to-amber-50/60 p-4">
          <div className="grid gap-3 sm:grid-cols-[140px_1fr] sm:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-orange-700">Overall Score</p>
              <p className="mt-1 text-3xl font-semibold text-stone-900">{averageRating}</p>
              <p className="text-sm text-stone-600">Based on {feedbackCount} verified reviews</p>
            </div>
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="grid grid-cols-[56px_1fr_40px] items-center gap-2 text-sm">
                  <span className="text-stone-700">{item.rating} stars</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-orange-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="text-right text-stone-600">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {publicFeedbacks === null ? (
          <p className="mt-3 text-sm text-stone-500">Loading customer reviews...</p>
        ) : publicFeedbacks.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">No customer reviews available yet.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {publicFeedbacks.map((feedback, index) => (
              <article
                key={feedback._id}
                className="rounded-xl border border-orange-100 bg-orange-50/30 p-4 shadow-sm animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 0.06, 0.42)}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-stone-800">{feedback.customerName}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{feedback.poojaTitle}</p>
                  </div>
                  <StarRow rating={feedback.rating} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-stone-700 sm:text-base">{feedback.comment}</p>
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
