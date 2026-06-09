/**
 * @fileoverview Interactive green alternatives map panel.
 * Displays either a live Google Map or a mock explorer with nearby
 * EV chargers and transit stations.
 */

import { useRef } from 'react'
import PropTypes from 'prop-types'
import { Star } from 'lucide-react'
import { useGoogleMap } from '../../hooks/useGoogleMap.js'
import { trackEvent } from '../../services/analytics.js'
import PlaceCard from './PlaceCard.jsx'

export default function GreenMapPanel({ totalEmissions }) {
  const mapRef = useRef(null)
  const { places, selectedPlace, setSelectedPlace, isUsingMock, handleMockPlaceSelect } = useGoogleMap(mapRef)

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full">
      {/* Map pane */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-eco-200 min-h-[260px] bg-stone-100 shadow-inner">
        {isUsingMock ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-emerald-50/20">
            <div className="w-12 h-12 rounded-full bg-eco-100 text-eco-600 flex items-center justify-center text-xl mb-3" aria-hidden="true">📍</div>
            <h4 className="font-bold text-eco-800 text-sm">Interactive Green Explorer Map</h4>
            <p className="text-xs text-eco-600 max-w-sm mt-1">
              Providing live suggestions for EV Chargers &amp; Green Transit stations around you.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-md">
              {places.map((p) => (
                <button
                  key={p.placeId}
                  onClick={() => handleMockPlaceSelect(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200
                    ${selectedPlace?.placeId === p.placeId
                      ? 'bg-eco-600 text-white border-eco-600'
                      : 'bg-white text-eco-600 hover:bg-eco-50 border-eco-200'}`}
                >
                  {p.type === 'charger' ? '⚡' : '🚌'} {p.name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-eco-400 mt-4 italic">
              (Mock Map visualization active — configure VITE_GOOGLE_MAPS_API_KEY to load live Google Maps SDK)
            </p>
          </div>
        ) : (
          <div ref={mapRef} className="absolute inset-0 w-full h-full" />
        )}
      </div>

      {/* Sidebar / details pane */}
      <div className="w-full lg:w-72 flex flex-col gap-3">
        <div>
          <h4 className="font-bold text-xs text-eco-700 uppercase tracking-wider">Nearby Alternatives</h4>
          {totalEmissions > 0 && (
            <p className="text-[10px] text-eco-500 mt-0.5">
              Your footprint: <strong className="text-eco-600">{totalEmissions}t CO2e</strong>. Find ways to reduce it below.
            </p>
          )}
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[180px] lg:max-h-[260px] pr-1">
          {places.map((place) => (
            <button
              key={place.placeId}
              onClick={() => { setSelectedPlace(place); trackEvent('google_maps_search', { query: place.name }) }}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5
                ${selectedPlace?.placeId === place.placeId
                  ? 'border-eco-500 bg-eco-50'
                  : 'border-eco-100 bg-white hover:border-eco-200'}`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-xs font-bold text-eco-800 line-clamp-1">{place.name}</span>
                <span className="text-[10px] bg-eco-100 text-eco-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                  {place.type === 'charger' ? '⚡ EV' : '🚌 Transit'}
                </span>
              </div>
              <p className="text-[10px] text-eco-500 mt-1 line-clamp-1">{place.vicinity}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-600">
                <Star size={10} className="fill-current" aria-hidden="true" />
                <span className="font-bold">{place.rating} / 5.0</span>
              </div>
            </button>
          ))}
        </div>

        <PlaceCard place={selectedPlace} />
      </div>
    </div>
  )
}

GreenMapPanel.propTypes = {
  totalEmissions: PropTypes.number.isRequired,
}
