import type {styleOptions} from './rn-style-config'

type Stats = {
  avg: number,
  max: number,
  min: number
}

type BikeRentalStation = {
  name: string
}

export type StreetEdge = {
  absoluteDirection: string,
  bikeRentalOffStation?: BikeRentalStation,
  bikeRentalOnStation?: BikeRentalStation,
  distance: number,
  geometry: {
    length: number,
    points: string
  },
  mode: string,
  relativeDirection: string,
  streetName?: string
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
  fromName: string,
  icon: {
    modeifyIcon: boolean,
    name: string
  },
  iconColor: string,
  routes: Array<Route>,
  rowStyle: styleOptions,
  segmentPatterns: Array<Pattern>,
  textStyle: styleOptions,
  walkTime: number
}

export type NonTransitModeDetails = {
  mode: string,
  streetEdges: Array<StreetEdge>,
  time: number
}

export type Pattern = {
  color: string,
  longName: string,
  shield: string,
  shortName?: string
}

export type TransitModeDetails = {
  fromName: string,
  mode: string,
  rideStats: Stats,
  routes: Array<Route>,
  segmentPatterns: Array<Pattern>,
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
  modes: Array<string>,
  stats: Stats,
  summary: string
}

export type TransitProfile = {
  access: Array<NonTransitModeDetails>,
  egress: Array<NonTransitModeDetails>,
  fares: Array<Fare>,
  modes: Array<string>,
  stats: Stats,
  summary: string,
  transit: Array<TransitModeDetails>
}

export type TripPlanResult = {
  profile: Array<TransitProfile | NonTransitProfile>
}

export type ModeifyResults = {

}
