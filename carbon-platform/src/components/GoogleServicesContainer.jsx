/**
 * @fileoverview GoogleServicesContainer Component.
 * Integrates Google Translate, Google Maps Platform (Green Alternatives Finder),
 * and YouTube Education Hub.
 */

import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin, Globe, Compass, Film, ExternalLink, Star } from 'lucide-react'
import { MAPS_API_KEY } from '../constants/emissions.js'
import { trackEvent } from '../services/analytics.js'

// Mock stations for fallback rendering
const MOCK_PLACES = [
  { name: 'Eco-Charge Hub', vicinity: 'Sector 62, Noida, UP', lat: 28.6273, lng: 77.3727, rating: 4.8, placeId: 'mock-ev-1', type: 'charger' },
  { name: 'GreenDrive Stations', vicinity: 'Indiranagar, Bengaluru, KA', lat: 12.9716, lng: 77.5946, rating: 4.5, placeId: 'mock-ev-2', type: 'charger' },
  { name: 'Metro Line Transit Hub', vicinity: 'Connaught Place, New Delhi', lat: 28.6304, lng: 77.2177, rating: 4.6, placeId: 'mock-tr-1', type: 'transit' },
  { name: 'Rapid Electric Chargers', vicinity: 'Bandra West, Mumbai, MH', lat: 19.0596, lng: 72.8295, rating: 4.7, placeId: 'mock-ev-3', type: 'charger' },
]

export default function GoogleServicesContainer({ totalEmissions }) {
  const [activeTab, setActiveTab] = useState('map')
  const [places, setPlaces] = useState(MOCK_PLACES)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [mapError, setMapError] = useState(false)
  const [isUsingMock, setIsUsingMock] = useState(!MAPS_API_KEY)
  const mapRef = useRef(null)

  // 1. Initialise Google Translate
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadTranslate = () => {
      if (window.google?.translate?.TranslateElement) return

      // Clean existing script
      const existing = document.getElementById('google-translate-script')
      if (existing) return

      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        )
        trackEvent('google_translate_activated')
      }
    }

    loadTranslate()
  }, [])

  // 2. Initialise Google Map (if API Key exists)
  useEffect(() => {
    if (!MAPS_API_KEY || !mapRef.current) {
      setIsUsingMock(true)
      return
    }

    let map = null
    const loader = new Loader({
      apiKey: MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places'],
    })

    loader
      .load()
      .then((google) => {
        setIsUsingMock(false)
        const initialCoords = { lat: 20.5937, lng: 78.9629 } // Centred in India

        map = new google.maps.Map(mapRef.current, {
          center: initialCoords,
          zoom: 5,
          mapId: 'DEMO_MAP_ID',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        })

        // Try getting user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
              map.setCenter(userLoc)
              map.setZoom(13)

              // Fetch nearby transit / EV stations via PlacesService
              const request = {
                location: userLoc,
                radius: '5000',
                type: 'electric_vehicle_charging_station',
              }

              const service = new google.maps.places.PlacesService(map)
              service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  const items = results.slice(0, 10).map((r) => ({
                    name: r.name,
                    vicinity: r.vicinity || 'Nearby Station',
                    lat: r.geometry.location.lat(),
                    lng: r.geometry.location.lng(),
                    rating: r.rating || 4.2,
                    placeId: r.place_id,
                    type: 'charger',
                  }))

                  setPlaces(items)

                  // Create Markers
                  items.forEach((item) => {
                    const marker = new google.maps.Marker({
                      position: { lat: item.lat, lng: item.lng },
                      map,
                      title: item.name,
                      icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      },
                    })

                    marker.addListener('click', () => {
                      setSelectedPlace(item)
                      trackEvent('google_maps_marker_selected', { name: item.name })
                    })
                  })
                }
              })
            },
            () => {
              // Location permission denied, keep default view
            }
          )
        }
      })
      .catch((err) => {
        console.error('Maps failed to load:', err)
        setMapError(true)
        setIsUsingMock(true)
      })
  }, [activeTab])

  const handleMockPlaceSelect = (place) => {
    setSelectedPlace(place)
    trackEvent('google_maps_search', { query: place.name })
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
      {/* Container Header */}
      <div className="bg-eco-700 p-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-eco-200 animate-pulse" />
          <div>
            <h3 className="font-bold text-sm">Google Services Integration</h3>
            <p className="text-xs text-eco-200">Interactive Maps, Multi-language Translate & Video</p>
          </div>
        </div>

        {/* Google Translate Integration Container */}
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
      <div className="flex border-b border-eco-100 bg-eco-50/70 p-1">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200
            ${activeTab === 'map' ? 'bg-white text-eco-800 shadow-sm' : 'text-eco-500 hover:text-eco-700'}`}
        >
          <Compass size={14} />
          Green Alternatives Map
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl transition-all duration-200
            ${activeTab === 'education' ? 'bg-white text-eco-800 shadow-sm' : 'text-eco-500 hover:text-eco-700'}`}
        >
          <Film size={14} />
          Climate Education Hub
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 flex flex-col">
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full">
            {/* Map pane */}
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-eco-200 min-h-[260px] bg-stone-100 shadow-inner">
              {isUsingMock ? (
                /* Interactive Canvas Map Mock if no Key */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-emerald-50/20">
                  <div className="w-12 h-12 rounded-full bg-eco-100 text-eco-600 flex items-center justify-center text-xl mb-3">📍</div>
                  <h4 className="font-bold text-eco-800 text-sm">Interactive Green Explorer Map</h4>
                  <p className="text-xs text-eco-600 max-w-sm mt-1">
                    Providing live suggestions for EV Chargers & Green Transit stations around you.
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
                /* Actual Google Map Div */
                <div ref={mapRef} className="absolute inset-0 w-full h-full" />
              )}
            </div>

            {/* Sidebar / details pane */}
            <div className="w-full lg:w-72 flex flex-col gap-3">
              <h4 className="font-bold text-xs text-eco-700 uppercase tracking-wider">Nearby Alternatives</h4>
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
                      <Star size={10} className="fill-current" />
                      <span className="font-bold">{place.rating} / 5.0</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedPlace && (
                <div className="p-3 bg-eco-50 border border-eco-200 rounded-xl animate-slide-up">
                  <h5 className="font-bold text-xs text-eco-800">{selectedPlace.name}</h5>
                  <p className="text-[10px] text-eco-600 mt-0.5">{selectedPlace.vicinity}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}&travelmode=transit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-eco-700 mt-2 hover:underline"
                    onClick={() => trackEvent('google_maps_directions_clicked', { name: selectedPlace.name })}
                  >
                    Directions on Google Maps
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full items-stretch">
            {/* YouTube embed */}
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-eco-200 min-h-[260px] bg-stone-900 shadow-lg">
              <iframe
                title="Curated Google Climate Change Educational Video"
                src="https://www.youtube.com/embed/8q7_aV8eFRo?enablejsapi=1"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => trackEvent('youtube_video_played')}
              />
            </div>

            {/* Video description */}
            <div className="w-full lg:w-72 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-eco-500 uppercase tracking-widest">Featured Media</span>
              <h4 className="font-bold text-eco-800 text-sm mt-1">Understanding Carbon Budgets</h4>
              <p className="text-xs text-eco-600 leading-relaxed mt-2">
                This Google-integrated YouTube player covers how personal choices directly impact global carbon budgets,
                showing how structural updates to housing, travel, and food supply chains combine to halt emissions.
              </p>
              <div className="mt-4 p-3 bg-eco-50 rounded-xl border border-eco-100 flex items-center gap-2">
                <span className="text-xl">💡</span>
                <p className="text-[10px] text-eco-600 font-medium">
                  Use the Google Translate widget at the top right to instantly read recommendations in other languages.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

GoogleServicesContainer.propTypes = {
  totalEmissions: PropTypes.number.isRequired,
}
