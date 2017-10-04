// @flow

import {ListView} from 'react-native'

import type {styleOptions} from './rn-style-config'

type Stats = {
  avg: number,
  max: number,
  min: number
}

export type BikeRentalStation = {
  id: string,
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
  fromName?: string,
  icon: {
    modeifyIcon: boolean,
    name: string
  },
  iconColor: string,
  routes?: Array<Route>,
  routeStyle?: {
    alight?: boolean,
    board?: boolean,
    color: string,
    lastColor?: string,
    take?: boolean,
    transfer?: boolean
  },
  rowStyle: styleOptions,
  segmentPatterns?: Array<Pattern>,
  textStyle: styleOptions,
  walkTime?: number
}

export type SegmentDisplay = {
  background?: Array<string>,
  mode: string,
  shortName?: string,
  longName?: string
}

export type NonTransitModeDetails = {
  mode: string,
  streetEdges: Array<StreetEdge>,
  time: number
}

export type Pattern = {
  color: string,
  longName: string,
  patternId: string,
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

export type Stop = {
  stop_id: string,
  stop_lat: number,
  stop_lon: number,
  stop_name: string
}

export type NonTransitProfile = {
  access: Array<NonTransitModeDetails>,
  modes: Array<string>,
  segmentDetails?: Array<SegmentDetail>,
  stats: Stats,
  summary: string
}

export type TransitProfile = {
  access: Array<NonTransitModeDetails>,
  egress: Array<NonTransitModeDetails>,
  fares: Array<Fare>,
  modes: Array<string>,
  segmentDetails?: Array<SegmentDetail>,
  stats: Stats,
  summary: string,
  transit: Array<TransitModeDetails>
}

export type TripPlanResult = {
  patterns: Pattern[],
  profile: Array<TransitProfile | NonTransitProfile>,
  stops: Stop[]
}

export type TripPlanResponse = {
  r5: TripPlanResult
}

export type ModeifyResult = {
  access: Array<NonTransitModeDetails>,
  averageTime: number,
  bikeDistances: boolean | string,
  bikeTime: string,
  costPerTrip: string,
  dataSource: ListView.DataSource,
  directCar: boolean,
  dominantMode: string,
  dominantModeIcon: string,
  driveDistances: boolean | string,
  freeflowTime: number,
  hasCar: boolean,
  hasTransit: boolean,
  modeDescriptor: string,
  modes: Array<string>,
  segments: Array<SegmentDisplay>,
  stats: Stats,
  summary: string,
  walkDistances: boolean | string,
  walkTime: string
}
