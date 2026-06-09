/**
 * @fileoverview Google Analytics 4 integration.
 * Loads gtag.js lazily and provides typed event helpers.
 * Respects Do Not Track and only loads after user consent.
 */

import { GA_MEASUREMENT_ID } from '../constants/emissions'

let _initialized = false

/**
 * Initialise Google Analytics 4.
 * Called once after the user has implicitly consented by using the app.
 */
export function initAnalytics() {
  if (_initialized || typeof window === 'undefined') return
  if (navigator.doNotTrack === '1') return   // Respect DNT

  // Inject gtag script
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  script.setAttribute('crossorigin', 'anonymous')
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,          // GDPR: anonymise IPs
    allow_google_signals: false, // No remarketing
    allow_ad_personalization_signals: false,
    send_page_view: true,
  })

  _initialized = true
}

/**
 * Send a custom event to GA4.
 * Safe to call before init — events are silently dropped.
 * @param {string} eventName
 * @param {Record<string, string|number>} [params]
 */
export function trackEvent(eventName, params = {}) {
  if (!_initialized || typeof window?.gtag !== 'function') return
  window.gtag('event', eventName, { ...params, app_name: 'CarbonWise' })
}

/**
 * Track calculator tab switches.
 * @param {'transport'|'home'|'lifestyle'} tab
 */
export const trackTabChange = (tab) => trackEvent('calculator_tab_change', { tab })

/**
 * Track when the user views their emissions report.
 * @param {number} total Total emissions in tonnes CO2e
 */
export const trackReportViewed = (total) =>
  trackEvent('report_viewed', { total_emissions: total })

/**
 * Track action plan task completion.
 * @param {string} actionId
 * @param {boolean} completed
 */
export const trackActionToggled = (actionId, completed) =>
  trackEvent('action_toggled', { action_id: actionId, completed: String(completed) })

/**
 * Track assistant panel opens.
 */
export const trackAssistantOpened = () => trackEvent('assistant_opened')
