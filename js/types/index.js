// @flow

import type {CurrentQuery} from './query'

export type RequestApi = {
  host: string,
  path: string
}

export type AppConfig = {
  analyticsKey: string,
  api: RequestApi,
  auth0: {
    clientId: string,
    domain: string
  },
  customOtpQueryBuilder?: (RequestApi, CurrentQuery) => string,
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
  modes: Array<string>,
  serviceAlertsUrl: string
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
