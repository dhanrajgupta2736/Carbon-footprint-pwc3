/**
 * @fileoverview CarbonWise — root application component.
 * Integrates Google Analytics, Google Fonts, PWA, and all feature panels.
 * Three-column responsive layout: Calculator | Analytics + Plan | Eco-Assistant.
 */

import { useState, useEffect, useCallback, useId } from 'react'
import { Car, Home, UtensilsCrossed, BarChart2, Zap, Globe } from 'lucide-react'
import { useCarbonData } from './hooks/useCarbonData.js'
import { useGoogleAuth } from './hooks/useGoogleAuth.js'
import TransportCalculator from './components/TransportCalculator.jsx'
import HomeCalculator from './components/HomeCalculator.jsx'
import LifestyleCalculator from './components/LifestyleCalculator.jsx'
import EmissionsChart from './components/EmissionsChart.jsx'
import ActionPlan from './components/ActionPlan.jsx'
import WelcomeDashboard from './components/WelcomeDashboard.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { FloatingAssistant, AssistantSidebar } from './components/EcoAssistant.jsx'
import GoogleServicesContainer from './components/GoogleServicesContainer.jsx'
import TabBar from './components/TabBar.jsx'
import SkipLink from './components/SkipLink.jsx'
import Header from './components/Header.jsx'
import FootprintBadge from './components/FootprintBadge.jsx'
import { initAnalytics, trackTabChange, trackReportViewed, trackEvent } from './services/analytics.js'

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

// ─── Root app ──────────────────────────────────────────────────────────────
export default function App() {
  const [calcTab, setCalcTab]               = useState('transport')
  const [rightTab, setRightTab]             = useState('chart')
  const [showCalculator, setShowCalculator] = useState(false)
  const panelId = useId()

  // Google sign-in and developer login simulation via custom hook
  const { user, loginSimulated, logout } = useGoogleAuth()

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
          onLogin={loginSimulated}
          onLogout={logout}
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
