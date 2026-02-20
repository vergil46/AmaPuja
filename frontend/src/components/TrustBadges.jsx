function TrustBadges() {
  const items = ['Verified Pandits', 'Secure Online Payments', 'Transparent Pricing', 'On-time Service']
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h3 className="text-2xl font-semibold text-center">Why Families Trust Ama Puja</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {items.map((item) => (
          <div key={item} className="bg-white rounded-xl border border-orange-100 p-4 text-center text-sm font-medium">
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}

export default TrustBadges
