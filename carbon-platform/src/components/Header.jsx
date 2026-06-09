/**
 * @fileoverview Site header with branding, Google Sign-In, and navigation.
 * Sticky header with blur effect and conditional reset button.
 */

import PropTypes from 'prop-types'
import { Leaf, RotateCcw } from 'lucide-react'

export default function Header({ hasData, onReset, user, onLogin, onLogout }) {
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
  user: PropTypes.shape({
    name:    PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
    email:   PropTypes.string,
  }),
  onLogin:  PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
}

Header.defaultProps = {
  user: null,
}
