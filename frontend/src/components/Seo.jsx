import { useEffect } from 'react'

function Seo({ title, description, canonical, structuredData }) {
  useEffect(() => {
    document.title = title
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = description
      document.head.appendChild(meta)
    }

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
  }, [title, description, canonical, structuredData])

  return null
}

export default Seo
