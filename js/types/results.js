import type {styleOptions} from './rn-style-config'

type Stats = {
  avg: number,
  max: number,
  min: number
}

type StreetEdge = {
  distance: number,
  geometry: {
    length: number,
    points: string
  }
}

export type Route = {
  agencyName?: string,
  color: string,
  id: string,
  longName: string,
  mode: string,
  shortName: string
}

export type SegmentDetail = {
  description: string,
  icon: {
    modeifyIcon: boolean,
    name: string
  },
  iconColor: string,
  rowStyle: styleOptions,
  textStyle: styleOptions
}

type NonTransitModeDetails = {
  mode: string,
  streetEdges: Array<StreetEdge>,
  time: number
}

type TransitModeDetails = {
  fromName: string,
  mode: string,
  rideStats: Stats,
  routes: Array<Route>,
  toName: string,
  waitStats: Stats,
  walkDistance: number,
  walkTime: number
}

type Fare = {
  low: number,
  peak: number,
  senior: number,
  type: string
}

export type NonTransitProfile = {
  access: Array<NonTransitModeDetails>,
  stats: Stats,
  summary: string
}

export type TransitProfile = {
  access: Array<NonTransitModeDetails>,
  egress: Array<NonTransitModeDetails>,
  fares: Array<Fare>,
  stats: Stats,
  summary: string,
  transit: Array<TransitModeDetails>
}

export type TripPlanResult = {
  profile: Array<TransitProfile | NonTransitProfile>
}

export type ModeifyResults = {

}
