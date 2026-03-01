import Seo from '../components/Seo'
import { Link } from 'react-router-dom'

const blogPosts = [
  {
    id: 1,
    title: 'How to Choose the Right Pandit for Your Puja',
    summary: 'Tips and guidance for selecting a trusted priest for your rituals.',
    date: '2026-02-24',
    image: '/proofs/work1.jpeg',
  },
  {
    id: 2,
    title: 'Benefits of Performing Griha Pravesh Puja',
    summary: 'Discover the spiritual and practical benefits of housewarming rituals.',
    date: '2026-02-20',
    image: '/proofs/work2.jpeg',
  },
]

function BlogPage() {
  return (
    <>
      <Seo title="Blog & Articles | PujaSamrddhi" description="Read helpful articles about pujas, rituals, and spiritual guidance." />
      <section className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Blog & Articles</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map(post => (
            <article key={post.id} className="card bg-white rounded-2xl border border-orange-100 shadow hover:shadow-lg transition-shadow flex flex-col">
              <img src={post.image} alt={post.title} className="rounded-t-2xl h-48 w-full object-cover" loading="lazy" />
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="font-semibold text-lg mb-2">{post.title}</h2>
                <p className="text-sm text-stone-600 mb-3">{post.summary}</p>
                <span className="text-xs text-stone-400 mb-2">{post.date}</span>
                <Link to="#" className="mt-auto text-orange-700 hover:text-orange-900 text-sm font-medium">Read More →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default BlogPage
