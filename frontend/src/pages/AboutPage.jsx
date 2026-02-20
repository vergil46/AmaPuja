import Seo from '../components/Seo'

function AboutPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <Seo title="About Ama Puja" description="Learn about Ama Puja and our mission to offer trusted pandit booking." />
      <h1 className="text-3xl font-semibold">About Ama Puja</h1>
      <p className="mt-4 text-stone-700">
        Ama Puja is a trust-focused platform helping families book authentic pandits for sacred rituals with clarity, punctuality, and devotion.
      </p>
    </section>
  )
}

export default AboutPage
