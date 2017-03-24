// @flow
import update from 'immutability-helper'

type appReducerState = {
  appState: string;
  locationFieldHasFocus: boolean;
}

type reduxAction = {
  payload: any
}

export const reducers = {
  'CHANGE_APP_STATE' (state: appReducerState, action: reduxAction) {
    return update(state, {
      appState: {
        $set: action.payload
      }
    })
  },
  'LOCATION_FIELD_FOCUS' (state: appReducerState, action: reduxAction) {
    return update(state, {
      locationFieldHasFocus: {
        $set: true
      }
    })
  },
  'LOCATION_FIELD_BLUR' (state: appReducerState, action: reduxAction) {
    return update(state, {
      locationFieldHasFocus: {
        $set: false
      }
    })
  },
  // ------------------------------------------------
  // OTP-RR handlers
  // ------------------------------------------------
  'PLAN_REQUEST' (state: appReducerState, action: reduxAction) {
    return update(state, {
      appState: {
        $set: 'results-list'
      }
    })
  }
}

export const initialState = {
  appState: 'home',
  locationFieldHasFocus: false
}
