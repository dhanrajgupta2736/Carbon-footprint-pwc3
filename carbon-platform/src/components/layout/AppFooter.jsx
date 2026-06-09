/**
 * @fileoverview Site footer with attribution and external links.
 */

export default function AppFooter() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-eco-100 mt-12 py-5 text-center text-xs text-eco-400"
    >
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
  )
}
