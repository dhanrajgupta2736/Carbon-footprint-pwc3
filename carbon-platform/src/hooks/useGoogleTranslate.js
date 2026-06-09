/**
 * @fileoverview Hook to initialise Google Translate widget.
 * Encapsulates script loading and element initialisation.
 */

import { useEffect } from 'react'
import { trackEvent } from '../services/analytics.js'

/**
 * Loads the Google Translate widget script and initialises it.
 * Idempotent — safe to call multiple times.
 */
export function useGoogleTranslate() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.google?.translate?.TranslateElement) return

    const existing = document.getElementById('google-translate-script')
    if (existing) return

    const script = document.createElement('script')
    script.id = 'google-translate-script'
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.body.appendChild(script)

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      )
      trackEvent('google_translate_activated')
    }
  }, [])
}
