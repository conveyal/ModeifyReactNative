// @flow

export type GeocodeResult = {
  geometry: {
    coordinates: [number, number]
  },
  properties: {
    address: string,
    label: string
  }
}

export type Location = {
  currentLocation?: boolean,
  lat: number,
  lon: number,
  name: string
}

export type CurrentQuery = {
  from?: Location,
  to?: Location
}

export type MapRegion = {
  latitude: number,
  latitudeDelta: number,
  longitude: number,
  longitudeDelta: number
}
