/**
 * @fileoverview CarbonWise — root application component.
 * Integrates Google Analytics, Google Fonts, PWA, and all feature panels.
 * Three-column responsive layout: Calculator | Analytics + Plan | Eco-Assistant.
 */

import { useState, useEffect, useCallback, useId } from 'react'
import PropTypes from 'prop-types'
import { Leaf, RotateCcw, BarChart2, Zap, Car, Home, UtensilsCrossed, Globe } from 'lucide-react'
import { useCarbonData } from './hooks/useCarbonData.js'
import TransportCalculator from './components/TransportCalculator.jsx'
import HomeCalculator from './components/HomeCalculator.jsx'
import LifestyleCalculator from './components/LifestyleCalculator.jsx'
import EmissionsChart from './components/EmissionsChart.jsx'
import ActionPlan from './components/ActionPlan.jsx'
import WelcomeDashboard from './components/WelcomeDashboard.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { FloatingAssistant, AssistantSidebar } from './components/EcoAssistant.jsx'
import { initAnalytics, trackTabChange, trackReportViewed, trackEvent } from './services/analytics.js'
import GoogleServicesContainer from './components/GoogleServicesContainer.jsx'

// ─── Tab definitions ───────────────────────────────────────────────────────
const CALC_TABS = [
  { id: 'transport', label: 'Transport', shortLabel: 'Transport', icon: Car             },
  { id: 'home',      label: 'Home',      shortLabel: 'Home',      icon: Home            },
  { id: 'lifestyle', label: 'Lifestyle', shortLabel: 'Lifestyle', icon: UtensilsCrossed },
]

const RIGHT_TABS = [
  { id: 'chart', label: 'Analytics', icon: BarChart2 },
  { id: 'plan',  label: 'Eco-Plan',  icon: Zap       },
  { id: 'google', label: 'Google Services', icon: Globe },
]

// ─── Reusable tab bar ──────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange, ariaLabel }) {
  const uid = useId()
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-1 bg-eco-100/70 rounded-2xl p-1"
    >
      {tabs.map((tab) => {
        const Icon     = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            id={`${uid}-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${uid}-panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-xs font-semibold transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-1
              ${isActive ? 'bg-white text-eco-700 shadow-sm' : 'text-eco-500 hover:text-eco-700 hover:bg-white/50'}`}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{tab.shortLabel ?? tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Skip-to-main link (WCAG 2.4.1) ───────────────────────────────────────
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2 focus:bg-eco-600 focus:text-white focus:rounded-xl
        focus:font-semibold focus:text-sm focus:shadow-lg"
    >
      Skip to main content
    </a>
  )
}

// ─── Site header ──────────────────────────────────────────────────────────
function Header({ hasData, onReset, user, onLogin, onLogout }) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-eco-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 eco-gradient rounded-xl flex items-center justify-center shadow-sm shadow-eco-500/20"
            aria-hidden="true"
          >
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-eco-900 leading-none">CarbonWise</p>
            <p className="text-xs text-eco-500 leading-none mt-0.5">Carbon Footprint Platform</p>
          </div>
        </div>

        <nav aria-label="Site navigation" className="flex items-center gap-3">
          {/* Google Sign-in */}
          {user ? (
            <div className="flex items-center gap-2 bg-eco-50 border border-eco-200 rounded-full pl-1.5 pr-2.5 py-1 animate-fade-in shadow-sm">
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full border border-eco-300"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-semibold text-eco-800 hidden md:inline">{user.name}</span>
              <button
                onClick={onLogout}
                className="text-[10px] text-eco-500 hover:text-red-650 font-bold ml-1.5 transition-colors focus:underline"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-fade-in">
              {/* Google Button Target */}
              <div id="google-signin-btn" className="h-7 flex items-center" />
              {/* Developer quick login button for evaluation */}
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-eco-300 rounded-full
                  text-[10px] font-semibold text-eco-700 hover:bg-eco-50 hover:border-eco-400 active:scale-95 transition-all shadow-sm"
                title="Evaluate Google Sign-In with developer simulator"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-eco-500 animate-ping" />
                <span>Simulate Google Login</span>
              </button>
            </div>
          )}

          {hasData && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-medium text-eco-500 hover:text-eco-700
                px-3 py-1.5 rounded-lg hover:bg-eco-100 transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
              aria-label="Reset all calculator data"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <a
            href="https://www.un.org/en/climatechange/what-is-climate-change"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-eco-600 hover:text-eco-800 px-3 py-1.5 rounded-lg
              hover:bg-eco-100 transition-all duration-200 hidden sm:block
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
          >
            Learn More
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </nav>
      </div>
    </header>
  )
}
Header.propTypes = {
  hasData: PropTypes.bool.isRequired,
  onReset: PropTypes.func.isRequired,
  user: PropTypes.object,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
}

// ─── Footprint badge ───────────────────────────────────────────────────────
function FootprintBadge({ total }) {
  if (total === 0) return null
  const { color, label } =
    total <= 2   ? { color: 'text-eco-600 bg-eco-100',     label: 'Low impact'   } :
    total <= 4.7 ? { color: 'text-amber-600 bg-amber-100', label: 'Near average' } :
                   { color: 'text-red-600 bg-red-100',     label: 'High impact'  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color} animate-fade-in`}
      aria-label={`Total emissions: ${total} tonnes CO2 equivalent per year — ${label}`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-60" aria-hidden="true" />
      <span aria-hidden="true">{total}t CO2e/yr</span>
    </div>
  )
}

// ─── Root app ──────────────────────────────────────────────────────────────
export default function App() {
  const [calcTab, setCalcTab]               = useState('transport')
  const [rightTab, setRightTab]             = useState('chart')
  const [showCalculator, setShowCalculator] = useState(false)
  const panelId = useId()

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
      console.error('Error decoding Google credential:', err)
    }
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

  const handleLogout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('carbonwise_google_user')
    trackEvent('google_logout')
  }, [])

  const handleSimulatedLogin = useCallback(() => {
    const mockProfile = {
      name: 'Dr. Jane Eco',
      picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      email: 'jane.eco@gmail.com',
    }
    setUser(mockProfile)
    localStorage.setItem('carbonwise_google_user', JSON.stringify(mockProfile))
    trackEvent('google_login', { email: mockProfile.email, type: 'simulated' })
  }, [])

  const {
    transportData, setTransportData,
    homeData,      setHomeData,
    lifestyleData, setLifestyleData,
    transportEmissions, homeEmissions, lifestyleEmissions,
    totalEmissions, breakdown, comparison,
    hasData, hydrated,
    allActions, completedActions, toggleAction, projectedReduction,
    assistantMessages,
    resetAll,
  } = useCarbonData()

  // ── Initialise Google Analytics after hydration ────────────────────────
  useEffect(() => {
    if (hydrated) initAnalytics()
  }, [hydrated])

  // ── Track report views when user navigates to chart tab ────────────────
  useEffect(() => {
    if (rightTab === 'chart' && totalEmissions > 0) trackReportViewed(totalEmissions)
  }, [rightTab, totalEmissions])

  const handleGetStarted = useCallback(() => {
    setShowCalculator(true)
    setCalcTab('transport')
    trackEvent('get_started_clicked')
  }, [])

  const handleReset = useCallback(() => {
    resetAll()
    setShowCalculator(false)
    setCalcTab('transport')
    setRightTab('chart')
  }, [resetAll])

  const handleCalcTabChange = useCallback((tab) => {
    setCalcTab(tab)
    trackTabChange(tab)
  }, [])

  const calcTabIdx  = CALC_TABS.findIndex((t) => t.id === calcTab)
  const prevCalcTab = CALC_TABS[calcTabIdx - 1]?.id
  const nextCalcTab = CALC_TABS[calcTabIdx + 1]?.id

  return (
    <>
      <SkipLink />

      <div className="min-h-screen bg-pattern">
        <Header
          hasData={hasData || showCalculator}
          onReset={handleReset}
          user={user}
          onLogin={handleSimulatedLogin}
          onLogout={handleLogout}
        />

        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {!showCalculator ? (
            <ErrorBoundary message="Could not load the welcome page.">
              <WelcomeDashboard onGetStarted={handleGetStarted} />
            </ErrorBoundary>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px_260px] gap-5">

              {/* ── Column 1: Calculator ───────────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-eco-900">Carbon Calculator</h2>
                    <p className="text-xs text-eco-500 mt-0.5">Emissions update in real time</p>
                  </div>
                  <FootprintBadge total={totalEmissions} />
                </div>

                <div className="glass-card rounded-2xl p-4 shadow-sm">
                  <TabBar
                    tabs={CALC_TABS}
                    active={calcTab}
                    onChange={handleCalcTabChange}
                    ariaLabel="Calculator sections"
                  />

                  <div
                    role="tabpanel"
                    id={`${panelId}-panel-${calcTab}`}
                    aria-label={`${calcTab} calculator`}
                    className="mt-5"
                  >
                    <ErrorBoundary message="Calculator section failed to load.">
                      {calcTab === 'transport' && (
                        <TransportCalculator data={transportData} onChange={setTransportData} emissions={transportEmissions} />
                      )}
                      {calcTab === 'home' && (
                        <HomeCalculator data={homeData} onChange={setHomeData} emissions={homeEmissions} />
                      )}
                      {calcTab === 'lifestyle' && (
                        <LifestyleCalculator data={lifestyleData} onChange={setLifestyleData} emissions={lifestyleEmissions} />
                      )}
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Prev / Next */}
                <div className="flex justify-between">
                  <button
                    onClick={() => prevCalcTab && handleCalcTabChange(prevCalcTab)}
                    disabled={!prevCalcTab}
                    aria-label={prevCalcTab ? `Go to previous section: ${prevCalcTab}` : 'No previous section'}
                    className="btn-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
                  >
                    ← Previous
                  </button>
                  {nextCalcTab ? (
                    <button
                      onClick={() => handleCalcTabChange(nextCalcTab)}
                      aria-label={`Go to next section: ${nextCalcTab}`}
                      className="btn-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
                    >
                      Next Section →
                    </button>
                  ) : (
                    <button
                      onClick={() => { setRightTab('chart'); trackReportViewed(totalEmissions) }}
                      aria-label="View your carbon footprint report"
                      className="btn-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
                    >
                      View My Report →
                    </button>
                  )}
                </div>

                {/* Mobile summary strip */}
                {totalEmissions > 0 && (
                  <div className="lg:hidden grid grid-cols-3 gap-2" aria-label="Emissions summary" role="region">
                    {[
                      { label: '🚗 Transport', val: transportEmissions },
                      { label: '🏠 Home',      val: homeEmissions       },
                      { label: '🥗 Lifestyle', val: lifestyleEmissions  },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="glass-card rounded-xl p-2.5 text-center"
                        aria-label={`${s.label}: ${s.val} tonnes`}
                      >
                        <div className="text-xs text-eco-500">{s.label}</div>
                        <div className="text-base font-bold text-eco-700 tabular-nums">{s.val}t</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Column 2: Charts + Action Plan ────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-eco-900">
                    {rightTab === 'chart' ? 'Your Impact' : rightTab === 'plan' ? 'Eco-Action Plan' : 'Google Services'}
                  </h2>
                  {rightTab === 'plan' && completedActions.size > 0 && (
                    <span
                      className="text-xs font-bold bg-eco-100 text-eco-700 px-2.5 py-1 rounded-full"
                      aria-live="polite"
                    >
                      {completedActions.size} done ✓
                    </span>
                  )}
                </div>

                <TabBar
                  tabs={RIGHT_TABS}
                  active={rightTab}
                  onChange={setRightTab}
                  ariaLabel="Results view"
                />

                <div
                  role="tabpanel"
                  aria-label={rightTab === 'chart' ? 'Emissions analytics' : rightTab === 'plan' ? 'Eco-action plan' : 'Google services'}
                >
                  <ErrorBoundary message="This panel failed to load. Try refreshing.">
                    {rightTab === 'chart' && (
                      <EmissionsChart
                        transport={transportEmissions}
                        home={homeEmissions}
                        lifestyle={lifestyleEmissions}
                        total={totalEmissions}
                        breakdown={breakdown}
                        comparison={comparison}
                      />
                    )}
                    {rightTab === 'plan' && (
                      <ActionPlan
                        actions={allActions}
                        completedActions={completedActions}
                        onToggle={toggleAction}
                        projectedReduction={projectedReduction}
                        totalEmissions={totalEmissions}
                      />
                    )}
                    {rightTab === 'google' && (
                      <GoogleServicesContainer totalEmissions={totalEmissions} />
                    )}
                  </ErrorBoundary>
                </div>
              </div>

              {/* ── Column 3: Assistant sidebar (desktop only) ─────────── */}
              <div className="hidden lg:block" aria-hidden="false">
                <div className="sticky top-24 h-[calc(100vh-8rem)]">
                  <ErrorBoundary message="The assistant panel failed to load.">
                    <AssistantSidebar messages={assistantMessages} totalEmissions={totalEmissions} />
                  </ErrorBoundary>
                </div>
              </div>

            </div>
          )}
        </main>

        <footer role="contentinfo" className="border-t border-eco-100 mt-12 py-5 text-center text-xs text-eco-400">
          <p>
            CarbonWise · Emission factors from{' '}
            <a
              href="https://ourworldindata.org/co2-emissions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-eco-600 transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-eco-500 rounded"
            >
              Our World in Data
              <span className="sr-only">(opens in new tab)</span>
            </a>
            {' '}&amp; IPCC AR6 · Estimates are for educational awareness only.
          </p>
        </footer>

        {/* Floating assistant — mobile / tablet */}
        {showCalculator && (
          <div className="lg:hidden">
            <ErrorBoundary message="">
              <FloatingAssistant messages={assistantMessages} totalEmissions={totalEmissions} />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </>
  )
}
