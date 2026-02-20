import Seo from '../components/Seo'

const policyContent = {
  refund: {
    title: 'Refund Policy',
    body: 'Refunds are reviewed based on service availability, cancellation timing, and ritual preparation status. Approved refunds are processed to the original payment method.',
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'We collect booking details only to deliver services, confirmations, and support. We do not sell personal information to third parties.',
  },
  terms: {
    title: 'Terms & Conditions',
    body: 'By booking with Ama Puja, you agree to package inclusions, payment terms, and respectful conduct standards during services.',
  },
}

function PolicyPage({ type }) {
  const content = policyContent[type]

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <Seo title={`${content.title} | Ama Puja`} description={content.body} />
      <h1 className="text-3xl font-semibold">{content.title}</h1>
      <p className="mt-4 text-stone-700">{content.body}</p>
    </section>
  )
}

export default PolicyPage
