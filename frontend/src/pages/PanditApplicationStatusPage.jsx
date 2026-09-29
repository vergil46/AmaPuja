import { useState } from 'react'
import Seo from '../components/Seo'
import api from '../services/api'

function PanditApplicationStatusPage() {
  const [form, setForm] = useState({ applicationId: '', mobile: '' })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError(''); setResult(null)
    try { const response = await api.get(`/pandits/applications/status/${encodeURIComponent(form.applicationId.trim())}`, { params: { mobile: form.mobile } }); setResult(response.data) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Unable to check application status.') }
    finally { setLoading(false) }
  }

  return <section className="mx-auto max-w-xl px-4 py-10"><Seo title="Check Pandit Application Status | Puja Samriddhi" description="Check the status of your private Pandit application." /><div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Pandit application</p><h1 className="mt-2 text-3xl font-semibold text-stone-900">Check application status</h1><p className="mt-2 text-sm text-stone-600">Enter the application ID shown after submission and the same mobile number used in the application.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium text-stone-700">Application ID<input required placeholder="PS-PND-2026-0001" value={form.applicationId} onChange={(event) => setForm({ ...form, applicationId: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label><label className="block text-sm font-medium text-stone-700">Mobile number<input required inputMode="tel" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>{error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60" type="submit">{loading ? 'Checking...' : 'Check status'}</button></form>{result && <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm text-stone-800"><p><strong>Application:</strong> {result.applicationId}</p><p className="mt-1"><strong>Status:</strong> {result.status}</p><p className="mt-1"><strong>Submitted:</strong> {new Date(result.createdAt).toLocaleString()}</p>{result.reviewedAt && <p className="mt-1"><strong>Reviewed:</strong> {new Date(result.reviewedAt).toLocaleString()}</p>}{result.rejectionReason && <p className="mt-2 text-red-700"><strong>Reason:</strong> {result.rejectionReason}</p>}{result.suspensionReason && <p className="mt-2 text-amber-700"><strong>Reason:</strong> {result.suspensionReason}</p>}</div>}</div></section>
}

export default PanditApplicationStatusPage