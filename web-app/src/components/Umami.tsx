import { useEffect } from 'react'

const Umami: React.FC = () => {
  useEffect(() => {
    const umamiUrl = import.meta.env.VITE_UMAMI_URL
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID

    if (!umamiUrl || !websiteId) {
      console.warn('Umami analytics not configured - missing VITE_UMAMI_URL or VITE_UMAMI_WEBSITE_ID')
      return
    }

    // Load Umami script dynamically
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.dataset.websiteId = websiteId
    script.src = `${umamiUrl}/umami.js`

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return null
}

export default Umami