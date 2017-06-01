// @flow

import lonlat from '@conveyal/lonlat'
import {ListView, PixelRatio} from 'react-native'

const config = require('../../config.json')

export function constructMapboxUrl (tileset: string) {
  const mapboxAccessToken = config.map.mapbox_access_token
  const isRetina = PixelRatio.get() > 1 ? '@2x' : ''
  const template = `https://api.mapbox.com/styles/v1/${tileset}/tiles/{z}/{x}/{y}${isRetina}?access_token=${mapboxAccessToken}`
  return template
}

export function createDataSource () {
  return new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
}

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
