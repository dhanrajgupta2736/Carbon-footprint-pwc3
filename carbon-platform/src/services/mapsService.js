/**
 * @fileoverview Google Maps Places API integration.
 * Uses @googlemaps/js-api-loader to lazy-load the Maps SDK.
 * Finds nearby EV charging stations and public transit stops
 * to power the "Find Green Alternatives" feature.
 */

import { Loader } from '@googlemaps/js-api-loader'
import { MAPS_API_KEY } from '../constants/emissions'

/** @type {google.maps.PlacesService|null} */
let placesService = null
let mapsLoaded = false

/**
 * Initialise the Maps SDK (idempotent).
 * @returns {Promise<void>}
 */
async function ensureMapsLoaded() {
  if (mapsLoaded) return

  if (!MAPS_API_KEY) {
    throw new Error('VITE_GOOGLE_MAPS_API_KEY is not set. Set it in .env to enable map features.')
  }

  const loader = new Loader({
    apiKey: MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'geometry'],
  })

  await loader.load()

  // PlacesService requires a map or attribution div
  const attrDiv = document.createElement('div')
  attrDiv.setAttribute('aria-hidden', 'true')
  document.body.appendChild(attrDiv)

  const tempMap = new window.google.maps.Map(attrDiv, {
    center: { lat: 20.5937, lng: 78.9629 }, // India centre
    zoom: 5,
  })

  placesService = new window.google.maps.places.PlacesService(tempMap)
  mapsLoaded = true
}

/**
 * @typedef {Object} NearbyPlace
 * @property {string} name
 * @property {string} vicinity
 * @property {number} lat
 * @property {number} lng
 * @property {number|null} rating
 * @property {string} placeId
 */

/**
 * Find nearby EV charging stations using Google Places API.
 * @param {{ lat: number, lng: number }} location
 * @param {number} [radiusMetres=5000]
 * @returns {Promise<NearbyPlace[]>}
 */
export async function findNearbyEVChargers(location, radiusMetres = 5000) {
  await ensureMapsLoaded()
  return searchNearby(location, radiusMetres, 'electric_vehicle_charging_station', 'EV Charger')
}

/**
 * Find nearby transit stations using Google Places API.
 * @param {{ lat: number, lng: number }} location
 * @param {number} [radiusMetres=3000]
 * @returns {Promise<NearbyPlace[]>}
 */
export async function findNearbyTransit(location, radiusMetres = 3000) {
  await ensureMapsLoaded()
  return searchNearby(location, radiusMetres, 'transit_station', 'Transit Stop')
}

/**
 * Internal: wrap PlacesService.nearbySearch in a Promise.
 * @param {{ lat: number, lng: number }} location
 * @param {number} radius
 * @param {string} type
 * @param {string} fallbackName
 * @returns {Promise<NearbyPlace[]>}
 */
function searchNearby(location, radius, type, fallbackName) {
  if (!placesService) return Promise.resolve([])

  return new Promise((resolve) => {
    placesService.nearbySearch(
      { location, radius, type },
      (results, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !results
        ) {
          resolve([])
          return
        }

        const places = results.slice(0, 5).map((r) => ({
          name:     r.name ?? fallbackName,
          vicinity: r.vicinity ?? '',
          lat:      r.geometry?.location?.lat() ?? 0,
          lng:      r.geometry?.location?.lng() ?? 0,
          rating:   r.rating ?? null,
          placeId:  r.place_id ?? '',
        }))

        resolve(places)
      },
    )
  })
}

/**
 * Build a Google Maps directions URL for a given place.
 * @param {NearbyPlace} place
 * @returns {string}
 */
export function getMapsDirectionsUrl(place) {
  const dest = encodeURIComponent(`${place.lat},${place.lng}`)
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=${place.placeId}&travelmode=transit`
}

/**
 * Build a Google Maps search URL for a query near coords.
 * @param {string} query
 * @param {{ lat: number, lng: number }} location
 * @returns {string}
 */
export function getMapsSearchUrl(query, location) {
  const q = encodeURIComponent(query)
  return `https://www.google.com/maps/search/${q}/@${location.lat},${location.lng},14z`
}
