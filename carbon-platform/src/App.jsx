/**
 * @fileoverview CarbonWise — root application component.
 * Composes layout columns, header, footer, and eco-assistant.
 * Three-column responsive layout: Calculator | Analytics + Plan | Eco-Assistant.
 */

import { useState, useEffect, useCallback, useId } from 'react'
import { Car, Home, UtensilsCrossed, BarChart2, Zap, Globe } from 'lucide-react'
import { useCarbonData } from './hooks/useCarbonData.js'
import { useGoogleAuth } from './hooks/useGoogleAuth.js'
import WelcomeDashboard from './components/WelcomeDashboard.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { FloatingAssistant, AssistantSidebar } from './components/EcoAssistant.jsx'
import CalculatorColumn from './components/layout/CalculatorColumn.jsx'
import AnalyticsColumn from './components/layout/AnalyticsColumn.jsx'
import AppFooter from './components/layout/AppFooter.jsx'
import SkipLink from './components/SkipLink.jsx'
import Header from './components/Header.jsx'
import { initAnalytics, trackTabChange, trackEvent } from './services/analytics.js'

/** @readonly Calculator tab definitions */
const CALC_TABS = [
  { id: 'transport', label: 'Transport', shortLabel: 'Transport', icon: Car             },
  { id: 'home',      label: 'Home',      shortLabel: 'Home',      icon: Home            },
  { id: 'lifestyle', label: 'Lifestyle', shortLabel: 'Lifestyle', icon: UtensilsCrossed },
]

/** @readonly Right-panel tab definitions */
const RIGHT_TABS = [
  { id: 'chart',  label: 'Analytics',       icon: BarChart2 },
  { id: 'plan',   label: 'Eco-Plan',        icon: Zap       },
  { id: 'google', label: 'Google Services', icon: Globe     },
]

export default function App() {
  const [calcTab, setCalcTab]               = useState('transport')
  const [rightTab, setRightTab]             = useState('chart')
  const [showCalculator, setShowCalculator] = useState(false)
  const panelId = useId()

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

  useEffect(() => { if (hydrated) initAnalytics() }, [hydrated])

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

  return (
    <>
      <SkipLink />

      <div className="min-h-screen bg-pattern">
        <Header hasData={hasData || showCalculator} onReset={handleReset} user={user} onLogin={loginSimulated} onLogout={logout} />

        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {!showCalculator ? (
            <ErrorBoundary message="Could not load the welcome page.">
              <WelcomeDashboard onGetStarted={handleGetStarted} />
            </ErrorBoundary>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px_260px] gap-5">
              <CalculatorColumn
                calcTabs={CALC_TABS} calcTab={calcTab} onCalcTabChange={handleCalcTabChange} panelId={panelId}
                transportData={transportData} setTransportData={setTransportData} transportEmissions={transportEmissions}
                homeData={homeData} setHomeData={setHomeData} homeEmissions={homeEmissions}
                lifestyleData={lifestyleData} setLifestyleData={setLifestyleData} lifestyleEmissions={lifestyleEmissions}
                totalEmissions={totalEmissions} setRightTab={setRightTab}
              />

              <AnalyticsColumn
                rightTabs={RIGHT_TABS} rightTab={rightTab} setRightTab={setRightTab}
                transportEmissions={transportEmissions} homeEmissions={homeEmissions} lifestyleEmissions={lifestyleEmissions}
                totalEmissions={totalEmissions} breakdown={breakdown} comparison={comparison}
                allActions={allActions} completedActions={completedActions} toggleAction={toggleAction} projectedReduction={projectedReduction}
              />

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

        <AppFooter />

        {showCalculator && (
          <div className="lg:hidden">
            <ErrorBoundary message="The assistant widget failed to load.">
              <FloatingAssistant messages={assistantMessages} totalEmissions={totalEmissions} />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </>
  )
}
