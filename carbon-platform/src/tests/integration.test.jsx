import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App.jsx'

// Mock Google accounts API & translate API to prevent network or window references breaking tests
beforeEach(() => {
  globalThis.window.google = {
    accounts: {
      id: {
        initialize: vi.fn(),
        renderButton: vi.fn(),
      },
    },
    translate: {
      TranslateElement: {
        InlineLayout: { SIMPLE: 'simple' },
      },
    },
  }
  localStorage.clear()
})

describe('CarbonWise Complete Flow Integration', () => {
  it('navigates from welcome screen, performs calculations, checks actions, and resets', async () => {
    render(<App />)

    // 1. Verify Welcome Dashboard is initially rendered
    expect(screen.getByRole('heading', { name: /Discover Your/i })).toBeInTheDocument()


    // 2. Click "Start Calculating" button to reveal calculator workspace
    const startBtn = screen.getByRole('button', { name: /Start Calculating/i })
    fireEvent.click(startBtn)

    // Verify calculator page has loaded
    expect(screen.getByRole('heading', { name: /Carbon Calculator/i })).toBeInTheDocument()

    // 3. Interact with the Transport slider to trigger emission updates
    const kmSlider = screen.getByLabelText(/Daily Commute Distance/i)
    fireEvent.change(kmSlider, { target: { value: '40' } })

    // Verify transport emissions box has updated and is rendered
    await waitFor(() => {
      expect(screen.getByText(/Transport Footprint/i)).toBeInTheDocument()
    })

    // 4. Switch from Transport to Home calculator tab
    const homeTab = screen.getByRole('tab', { name: /Home/i })
    fireEvent.click(homeTab)

    // Verify we are on the Home Energy Calculator panel
    expect(screen.getByText(/Primary Energy \/ Heating Source/i)).toBeInTheDocument()

    // Input monthly kWh usage
    const kwhInput = screen.getByLabelText(/Monthly Electricity Usage/i)
    fireEvent.change(kwhInput, { target: { value: '250' } })

    // Verify home emissions box updates
    await waitFor(() => {
      expect(screen.getByText(/Home Energy Footprint/i)).toBeInTheDocument()
    })

    // 5. Navigate to the Eco-Plan Tab to view actionable recommendations
    const ecoPlanTab = screen.getByRole('tab', { name: /Eco-Plan/i })
    fireEvent.click(ecoPlanTab)

    // Verify Action Plan is active and EV switch advice is present due to default petrol vehicle type
    expect(screen.getByText(/Carbon Reduced/i)).toBeInTheDocument()
    expect(screen.getByText(/Switch to an EV or Hybrid/i)).toBeInTheDocument()


    // 6. Complete an action item and observe the progress metrics shift
    const evActionToggle = screen.getByLabelText(/Mark "Switch to an EV or Hybrid" as complete/i)
    fireEvent.click(evActionToggle)

    // Verify action state is updated and the toggle changes its label to represent completion state
    await waitFor(() => {
      expect(screen.getByLabelText(/Mark "Switch to an EV or Hybrid" as incomplete/i)).toBeInTheDocument()
    })

    // 7. Click Reset in the header and verify we return to onboarding Welcome Screen
    const resetBtn = screen.getByRole('button', { name: /Reset/i })
    fireEvent.click(resetBtn)

    // Verify welcome onboarding dashboard is visible again
    expect(screen.getByText(/Discover Your/i)).toBeInTheDocument()
  })
})
