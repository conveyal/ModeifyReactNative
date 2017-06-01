// @flow

import update from 'immutability-helper'

import type {ServiceAlert, ServiceAlertsReducerState} from '../types/reducers'

type setServiceAlertsAction = {
  payload: {
    alerts?: ServiceAlert[],
    success: boolean
  },
  type: string
}

export const reducers = {
  'SET_SERVICE_ALERTS' (
    state: ServiceAlertsReducerState,
    action: setServiceAlertsAction
  ): ServiceAlertsReducerState {
    if (action.payload.success) {
      return update(state, {
        alerts: { $set: action.payload.alerts },
        loaded: { $set: true },
        success: { $set: true }
      })
    } else {
      return update(state, {
        alerts: { $set: [] },
        loaded: { $set: true },
        success: { $set: false }
      })
    }
  }
}

export const initialState: ServiceAlertsReducerState = {
  alerts: [],
  loaded: false,
  success: false
}
