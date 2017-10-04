// @flow

import type {AppConfig} from './'
import type {CurrentQuery} from './query'
import type {TripPlanResponse} from './results'

export type AppReducerState = {
  planViewState: 'init' | 'result-collapsed' | 'result-summarized' | 'result-expanded',
  searchingOnMap: boolean
}

export type PlanSearch = {
  activeItinerary: ?number,
  planResponse: TripPlanResponse
}

export type OtpReducerState = {
  config: AppConfig,
  currentQuery: CurrentQuery,
  searches: PlanSearch[],
  activeSearch: number
}

export type ServiceAlert = {
  alertUrl: string,
  fromDate: string,
  text: string,
  toDate: string
}

export type ServiceAlertsReducerState = {
  alerts: ServiceAlert[],
  loaded: boolean,
  success: boolean
}

export type ModeifyPlace = {
  address: string
}

export type ModeifyOpts = {
  bikeSpeed: number,
  bikeTrafficStress: number,
  carCostPerMile: number,
  carParkingCost: number,
  maxBikeTime: number,
  maxWalkTime: number,
  walkSpeed: number
}

export type UserMetadata = {
  modeify_opts?: ModeifyOpts,
  modeify_places?: Array<ModeifyPlace>
}

export type UserReducerState = {
  idToken?: string,
  name?: string,
  picture?: string,
  refreshToken?: string,
  userId: string,
  userMetadata?: UserMetadata
}

export type ReducersState = {
  app: AppReducerState,
  otp: OtpReducerState,
  user: UserReducerState
}
