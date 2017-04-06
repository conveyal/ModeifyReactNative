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
  'CHANGE_PLAN_POSTPROCESS_SETTING' (state: appReducerState, action: reduxAction) {
    return update(state, {
      planPostprocessSettings: {
        [action.payload.setting]: {
          $set: action.payload.value
        }
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
    if (state.appState === 'settings') {
      return state
    }
    return update(state, {
      appState: {
        $set: 'results-list'
      }
    })
  }
}

// export const initialState = {
//   appState: 'home',
//   locationFieldHasFocus: false
// }

export const initialState = {
  appState: 'settings',
  locationFieldHasFocus: false,
  planPostprocessSettings: {
    parkingCost: 10,
    drivingCostPerMile: 0.56
  }
}
