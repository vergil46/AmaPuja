import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import api from '../services/api'

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className={`text-3xl leading-none transition ${star <= value ? 'text-amber-500' : 'text-stone-300'} hover:text-amber-500`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function FeedbackPage() {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [form, setForm] = useState({ customerName: '', rating: 5, comment: '' })
  const [state, setState] = useState({ loading: true, submitting: false, message: '', error: '' })

  useEffect(() => {
    api.get(`/feedback/booking/${bookingId}`)
      .then(({ data }) => {
        setBooking(data)
        setForm((previous) => ({ ...previous, customerName: data.customerName || '' }))
      })
      .catch((error) => setState({ loading: false, submitting: false, message: '', error: error.response?.data?.message || 'Booking not found.' }))
      .finally(() => setState((previous) => ({ ...previous, loading: false })))
  }, [bookingId])

  const submit = async (event) => {
    event.preventDefault()
    setState((previous) => ({ ...previous, submitting: true, error: '', message: '' }))
    try {
      const response = await api.post('/feedback/public', { bookingId, ...form })
      setBooking((previous) => ({ ...previous, hasFeedback: true }))
      setState((previous) => ({ ...previous, submitting: false, message: response.data.message || 'Thank you. Your review is pending approval.' }))
    } catch (error) {
      setState((previous) => ({ ...previous, submitting: false, error: error.response?.data?.message || 'Unable to submit feedback.' }))
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <Seo title="Share Your Feedback | Puja Samriddhi" description="Share feedback about your verified puja booking." />
      <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">Verified Booking Feedback</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">How was your puja experience?</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">Your feedback helps other families choose with confidence.</p>

        {state.loading ? <p className="mt-8 text-sm text-stone-500">Loading booking details...</p> : state.error && !booking ? (
          <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{state.error}</div>
        ) : booking?.hasFeedback || state.message ? (
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
            {state.message || 'Feedback has already been submitted for this booking.'}
            <Link to="/ratings" className="mt-4 inline-block font-semibold underline">See customer reviews</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-stone-700" htmlFor="feedback-name">Customer name</label>
                <input id="feedback-name" required value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" />
              </div>
              <div>
                <span className="text-sm font-medium text-stone-700">Booking ID</span>
                <p className="mt-1.5 break-all rounded-xl bg-stone-50 px-3.5 py-3 text-sm text-stone-600">{booking?.bookingId}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-stone-700">Puja name</span>
              <p className="mt-1.5 rounded-xl bg-stone-50 px-3.5 py-3 text-sm text-stone-700">{booking?.poojaName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-stone-700">Your rating</span>
              <div className="mt-1.5"><StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700" htmlFor="feedback-comment">Review or comment</label>
              <textarea id="feedback-comment" required maxLength={500} rows={5} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-300 px-3.5 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100" placeholder="Tell us about your experience" />
            </div>
            {state.error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{state.error}</p>}
            <button type="submit" disabled={state.submitting} className="w-full rounded-xl bg-orange-700 px-4 py-3 font-semibold text-white hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-60">
              {state.submitting ? 'Submitting...' : 'Submit feedback'}
            </button>
            <p className="text-center text-xs text-stone-500">Your review will appear after admin approval.</p>
          </form>
        )}
      </div>
    </section>
  )
}

export default FeedbackPage
