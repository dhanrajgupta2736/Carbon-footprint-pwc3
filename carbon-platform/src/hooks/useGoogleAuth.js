import { useState, useEffect, useCallback } from 'react'
import { trackEvent } from '../services/analytics.js'
import { logError } from '../utils/logger.js'

export function useGoogleAuth() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('carbonwise_google_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleCredentialResponse = useCallback((response) => {
    try {
      const base64Url = response.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const decoded = JSON.parse(jsonPayload)
      const profile = {
        name: decoded.name || 'Eco User',
        picture: decoded.picture || 'https://www.gravatar.com/avatar/?d=mp',
        email: decoded.email,
      }
      setUser(profile)
      localStorage.setItem('carbonwise_google_user', JSON.stringify(profile))
      trackEvent('google_login', { email: profile.email })
    } catch (err) {
      logError('GoogleAuth', err)
    }
  }, [])

  const loginSimulated = useCallback(() => {
    const mockProfile = {
      name: 'Dr. Jane Eco',
      picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      email: 'jane.eco@gmail.com',
    }
    setUser(mockProfile)
    localStorage.setItem('carbonwise_google_user', JSON.stringify(mockProfile))
    trackEvent('google_login', { email: mockProfile.email, type: 'simulated' })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('carbonwise_google_user')
    trackEvent('google_logout')
  }, [])

  useEffect(() => {
    if (user) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: '777777777777-mockid.apps.googleusercontent.com',
        callback: handleCredentialResponse,
      })
      const target = document.getElementById('google-signin-btn')
      if (target) {
        window.google?.accounts.id.renderButton(target, {
          theme: 'outline',
          size: 'small',
          shape: 'pill',
        })
      }
    }
    document.body.appendChild(script)
  }, [user, handleCredentialResponse])

  return {
    user,
    loginSimulated,
    logout,
    handleCredentialResponse,
  }
}
