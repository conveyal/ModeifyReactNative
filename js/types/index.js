// @flow

export type AppConfig = {
  api: {
    host: string,
    path: string
  },
  auth0: {
    clientId: string,
    domain: string
  },
  debouncePlanTimeMs: number,
  map: {
    initialRegion: {
      latitude: number,
      latitudeDelta: number,
      longitude: number,
      longitudeDelta: number
    },
    mapbox_access_token: string,
    mapbox_base_style: string,
    mapbox_label_style: string,
    showMapBoxTiles: boolean
  },
  geocoderSettings: {
    boundary: {
      rect: {
        minLon: number,
        minLat: number,
        maxLon: number,
        maxLat: number
      }
    },
    apiKey: string
  },
  modes: Array<string>
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

export type Node = {
  link?: string,
  text: string,
  type: string
}

export type Resource = {
  parsedNodes: Array<Node>,
  title: string
}
