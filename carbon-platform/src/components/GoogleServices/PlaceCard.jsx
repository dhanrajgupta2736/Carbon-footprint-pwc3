/**
 * @fileoverview Place detail card shown when a green alternative is selected.
 */

import PropTypes from 'prop-types'
import { ExternalLink } from 'lucide-react'
import { trackEvent } from '../../services/analytics.js'

export default function PlaceCard({ place }) {
  if (!place) return null

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=transit`

  return (
    <div className="p-3 bg-eco-50 border border-eco-200 rounded-xl animate-slide-up">
      <h5 className="font-bold text-xs text-eco-800">{place.name}</h5>
      <p className="text-[10px] text-eco-600 mt-0.5">{place.vicinity}</p>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] font-bold text-eco-700 mt-2 hover:underline"
        onClick={() => trackEvent('google_maps_directions_clicked', { name: place.name })}
      >
        Directions on Google Maps
        <ExternalLink size={10} aria-hidden="true" />
        <span className="sr-only">(opens in new tab)</span>
      </a>
    </div>
  )
}

PlaceCard.propTypes = {
  place: PropTypes.shape({
    name:     PropTypes.string.isRequired,
    vicinity: PropTypes.string.isRequired,
    lat:      PropTypes.number.isRequired,
    lng:      PropTypes.number.isRequired,
    rating:   PropTypes.number.isRequired,
    placeId:  PropTypes.string.isRequired,
    type:     PropTypes.string.isRequired,
  }),
}

PlaceCard.defaultProps = {
  place: null,
}
