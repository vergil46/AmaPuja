import { useEffect, useState } from 'react'

function DeferredAnalytics() {
  const [AnalyticsComponent, setAnalyticsComponent] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadAnalytics = () => {
      import('@vercel/analytics/react')
        .then((mod) => {
          if (isMounted) {
            setAnalyticsComponent(() => mod.Analytics)
          }
        })
        .catch(() => {
          // Keep analytics failure from affecting user experience.
        })
    }

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadAnalytics, { timeout: 3000 })
    } else {
      setTimeout(loadAnalytics, 1200)
    }

    return () => {
      isMounted = false
    }
  }, [])

  if (!AnalyticsComponent) return null

  return <AnalyticsComponent />
}

export default DeferredAnalytics
