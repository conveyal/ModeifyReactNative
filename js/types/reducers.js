import type {CurrentQuery} from './query'
import type {TripPlanResponse} from './results'

export type AppReducerState = {
  planPostprocessSettings: {
    parkingCost: number,
    drivingCostPerMile: number
  },
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

export type UserReducerState = {
  idToken?: string
}

export type ReducersState = {
  app: AppReducerState,
  otp: OtpReducerState,
  user: UserReducerState
}
