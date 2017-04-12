// @flow

import lonlat from '@conveyal/lonlat'

export function geolocateLocation (locationType: string, setLocation: Function) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        type: locationType,
        location: {
          currentLocation: true,
          name: 'Current Location',
          ...lonlat(position.coords)
        }
      })
    },
    (error) => {
      setLocation({
        type: locationType,
        location: null
      })
      alert(`Your location could not be determined.
        Please search for an address.`)
    },
    {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000}
  )
}
