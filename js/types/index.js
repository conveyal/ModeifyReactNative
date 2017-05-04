// @flow

export type GeocodeResult = {
  geometry: {
    coordinates: [number, number]
  },
  properties: {
    address: string;
    label: string
  }
}

export type Location = {
  lat: number;
  lon: number;
  name: string;
}

export type MapRegion = {
  latitude: number;
  latitudeDelta: number;
  longitude: number;
  longitudeDelta: number;
}
