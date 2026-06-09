/**
 * @fileoverview React Error Boundary — catches render-time errors gracefully.
 * Displays a user-friendly fallback instead of a blank screen.
 */

import { Component } from 'react'
import PropTypes from 'prop-types'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message ?? 'Unknown error' }
  }

  componentDidCatch(error, info) {
    // In production this would send to an error tracking service (e.g. Google Cloud Error Reporting)
    console.error('[CarbonWise ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center"
        >
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-500" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold text-eco-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-eco-500 mb-6 max-w-xs">
            {this.props.message ?? 'An unexpected error occurred in this section.'}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  message:  PropTypes.string,
}
