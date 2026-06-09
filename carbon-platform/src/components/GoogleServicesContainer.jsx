/**
 * @fileoverview GoogleServicesContainer — unified Google integrations panel.
 * Composes Google Translate, Maps (Green Alternatives Finder), and YouTube Hub.
 */

import { useState } from 'react'
import PropTypes from 'prop-types'
import { Globe, Compass, Film } from 'lucide-react'
import { useGoogleTranslate } from '../hooks/useGoogleTranslate.js'
import GreenMapPanel from './GoogleServices/GreenMapPanel.jsx'
import EducationPanel from './GoogleServices/EducationPanel.jsx'

export default function GoogleServicesContainer({ totalEmissions }) {
  const [activeTab, setActiveTab] = useState('map')

  useGoogleTranslate()

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="bg-eco-700 p-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-eco-200 animate-pulse" aria-hidden="true" />
          <div>
            <h3 className="font-bold text-sm">Google Services Integration</h3>
            <p className="text-xs text-eco-200">Interactive Maps, Multi-language Translate &amp; Video</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-2.5 py-1 text-xs">
          <span className="font-medium text-eco-200 text-[10px] uppercase">Language:</span>
          <div
            id="google_translate_element"
            className="google-translate-dropdown text-black rounded text-[11px]"
            aria-label="Google translate language widget"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-eco-100 bg-eco-50/70 p-1" role="tablist" aria-label="Google services sections">
        <button
          role="tab"
          aria-selected={activeTab === 'map'}
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500
            ${activeTab === 'map' ? 'bg-white text-eco-800 shadow-sm' : 'text-eco-500 hover:text-eco-700'}`}
        >
          <Compass size={14} aria-hidden="true" />
          Green Alternatives Map
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'education'}
          onClick={() => setActiveTab('education')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500
            ${activeTab === 'education' ? 'bg-white text-eco-800 shadow-sm' : 'text-eco-500 hover:text-eco-700'}`}
        >
          <Film size={14} aria-hidden="true" />
          Climate Education Hub
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {activeTab === 'map' && <GreenMapPanel totalEmissions={totalEmissions} />}
        {activeTab === 'education' && <EducationPanel />}
      </div>
    </div>
  )
}

GoogleServicesContainer.propTypes = {
  totalEmissions: PropTypes.number.isRequired,
}
