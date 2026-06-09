/**
 * @fileoverview Hook to initialise Google Maps SDK and find nearby green places.
 * Encapsulates all Maps API logic including geolocation and place search.
 */

import { useState, useEffect, useCallback } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MAPS_API_KEY } from '../constants/emissions.js'
import { trackEvent } from '../services/analytics.js'
import { logError } from '../utils/logger.js'

/** Fallback mock stations used when no API key is configured */
const MOCK_PLACES = Object.freeze([
  { name: 'Eco-Charge Hub',          vicinity: 'Sector 62, Noida, UP',       lat: 28.6273, lng: 77.3727, rating: 4.8, placeId: 'mock-ev-1', type: 'charger' },
  { name: 'GreenDrive Stations',     vicinity: 'Indiranagar, Bengaluru, KA', lat: 12.9716, lng: 77.5946, rating: 4.5, placeId: 'mock-ev-2', type: 'charger' },
  { name: 'Metro Line Transit Hub',  vicinity: 'Connaught Place, New Delhi', lat: 28.6304, lng: 77.2177, rating: 4.6, placeId: 'mock-tr-1', type: 'transit' },
  { name: 'Rapid Electric Chargers', vicinity: 'Bandra West, Mumbai, MH',   lat: 19.0596, lng: 72.8295, rating: 4.7, placeId: 'mock-ev-3', type: 'charger' },
])

/**
 * Manages Google Maps initialisation, place discovery, and selection state.
 * @param {React.RefObject<HTMLDivElement>} mapRef — ref to the map container div
 * @returns {{ places, selectedPlace, setSelectedPlace, isUsingMock, handleMockPlaceSelect }}
 */
export function useGoogleMap(mapRef) {
  const [places, setPlaces]               = useState(MOCK_PLACES)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [isUsingMock, setIsUsingMock]     = useState(!MAPS_API_KEY)

  const handleMockPlaceSelect = useCallback((place) => {
    setSelectedPlace(place)
    trackEvent('google_maps_search', { query: place.name })
  }, [])

  useEffect(() => {
    if (!MAPS_API_KEY || !mapRef?.current) {
      setIsUsingMock(true)
      return
    }

    const loader = new Loader({
      apiKey: MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    })

    loader
      .load()
      .then((google) => {
        setIsUsingMock(false)
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
          mapId: 'DEMO_MAP_ID',
          styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }],
        })

        if (!navigator.geolocation) return

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            map.setCenter(userLoc)
            map.setZoom(13)

            const service = new google.maps.places.PlacesService(map)
            service.nearbySearch(
              { location: userLoc, radius: '5000', type: 'electric_vehicle_charging_station' },
              (results, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return

                const items = results.slice(0, 10).map((r) => ({
                  name:     r.name,
                  vicinity: r.vicinity || 'Nearby Station',
                  lat:      r.geometry.location.lat(),
                  lng:      r.geometry.location.lng(),
                  rating:   r.rating || 4.2,
                  placeId:  r.place_id,
                  type:     'charger',
                }))
                setPlaces(items)

                items.forEach((item) => {
                  const marker = new google.maps.Marker({
                    position: { lat: item.lat, lng: item.lng },
                    map,
                    title: item.name,
                    icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
                  })
                  marker.addListener('click', () => {
                    setSelectedPlace(item)
                    trackEvent('google_maps_marker_selected', { name: item.name })
                  })
                })
              }
            )
          },
          () => { /* location permission denied — keep default view */ }
        )
      })
      .catch((err) => {
        logError('GoogleMap', err)
        setIsUsingMock(true)
      })
  }, [mapRef])

  return { places, selectedPlace, setSelectedPlace, isUsingMock, handleMockPlaceSelect }
}
