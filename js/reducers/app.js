// @flow
import update from 'immutability-helper'

import type {AppReducerState} from '../types/reducers'

type changePlanPostprocessSettingAction = {
  payload: {
    setting: string,
    value: string
  },
  type: string
}

type searchingOnMapAction = {
  payload: boolean,
  type: string
}

export const reducers = {
  'CHANGE_PLAN_POSTPROCESS_SETTING' (
    state: AppReducerState,
    action: changePlanPostprocessSettingAction
  ): AppReducerState {
    return update(state, {
      planPostprocessSettings: {
        [action.payload.setting]: {
          $set: action.payload.value
        }
      }
    })
  },
  'SEARCHING_ON_MAP' (
    state: AppReducerState,
    action: searchingOnMapAction
  ): AppReducerState {
    // temp fix for https://github.com/airbnb/react-native-maps/issues/453
    return update(state, {
      searchingOnMap: {
        $set: action.payload
      }
    })
  }
}

export const initialState = {
  planPostprocessSettings: {
    parkingCost: 10,
    drivingCostPerMile: 0.56
  },
  searchingOnMap: false
}
