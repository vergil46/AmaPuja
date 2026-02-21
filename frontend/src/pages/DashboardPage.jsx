import { useEffect, useState } from 'react'
import Seo from '../components/Seo'
import api from '../services/api'

function DashboardPage() {
  const [bookings, setBookings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [feedbackForm, setFeedbackForm] = useState({})
  const [feedbackMessage, setFeedbackMessage] = useState('')

  useEffect(() => {
    Promise.all([api.get('/bookings/my'), api.get('/feedback/my')]).then(([bookingRes, feedbackRes]) => {
      setBookings(bookingRes.data)
      setFeedbacks(feedbackRes.data)
    })
  }, [])

  const feedbackByBookingId = Object.fromEntries(feedbacks.map((item) => [item.bookingId, item]))

  const completedBookingsWithoutFeedback = bookings.filter(
    (booking) => booking.bookingStatus === 'completed' && !feedbackByBookingId[booking._id]
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

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <Seo title="Dashboard | Ama Puja" description="View your bookings and statuses on Ama Puja." />
      <h1 className="text-2xl sm:text-3xl font-semibold">My Dashboard</h1>
      <div className="mt-6 overflow-x-auto bg-white border border-stone-200 rounded-xl">
        <table className="w-full min-w-170 text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="p-3 text-left">Puja</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Package</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-t border-stone-200">
                <td className="p-3">{booking.poojaId?.title}</td>
                <td className="p-3">{booking.date} {booking.time}</td>
                <td className="p-3">{booking.package}</td>
                <td className="p-3">{booking.paymentStatus}</td>
                <td className="p-3">{booking.bookingStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-white border border-stone-200 rounded-xl p-4 sm:p-5">
        <h2 className="text-xl font-semibold">Share Feedback After Pooja</h2>
        <p className="mt-1 text-sm text-stone-600">You can submit feedback for completed poojas.</p>
        {feedbackMessage && <p className="mt-2 text-sm text-green-700">{feedbackMessage}</p>}

        {completedBookingsWithoutFeedback.length === 0 ? (
          <p className="mt-4 text-sm text-stone-600">No completed booking pending feedback.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {completedBookingsWithoutFeedback.map((booking) => (
              <div key={booking._id} className="border border-stone-200 rounded-lg p-4">
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
