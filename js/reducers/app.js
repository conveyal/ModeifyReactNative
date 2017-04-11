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
  'CHANGE_PLAN_POSTPROCESS_SETTING' (state: appReducerState, action: reduxAction) {
    return update(state, {
      planPostprocessSettings: {
        [action.payload.setting]: {
          $set: action.payload.value
        }
      }
    })
  }
}

export const initialState = {
  planPostprocessSettings: {
    parkingCost: 10,
    drivingCostPerMile: 0.56
  }
}
