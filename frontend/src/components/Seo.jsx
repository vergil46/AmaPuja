import { useEffect } from 'react'

function Seo({ title, description, canonical, keywords, structuredData }) {
  useEffect(() => {
    document.title = title

    const upsertMetaTag = (name, content) => {
      if (!content) return

      const existingMeta = document.querySelector(`meta[name="${name}"]`)
      if (existingMeta) {
        existingMeta.setAttribute('content', content)
        return
      }

      const meta = document.createElement('meta')
      meta.name = name
      meta.content = content
      document.head.appendChild(meta)
    }

    upsertMetaTag('description', description)
    upsertMetaTag('keywords', Array.isArray(keywords) ? keywords.join(', ') : keywords)

    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', canonical)
    }

    let scriptElement = null
    if (structuredData && typeof structuredData === 'object') {
      scriptElement = document.createElement('script')
      scriptElement.type = 'application/ld+json'
      scriptElement.setAttribute('data-seo-structured', 'true')
      scriptElement.text = JSON.stringify(structuredData)
      document.head.appendChild(scriptElement)
    }

    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement)
      }
    }
  }, [title, description, canonical, keywords, structuredData])

  return null
}

export default Seo
