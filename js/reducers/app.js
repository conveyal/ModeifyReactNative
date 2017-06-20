// @flow

import update from 'immutability-helper'

import type {AppReducerState} from '../types/reducers'

type changePlanViewStateAction = {
  payload: string,
  type: string
}

type searchingOnMapAction = {
  payload: boolean,
  type: string
}

export const reducers = {
  'CHANGE_PLAN_VIEW_STATE' (
    state: AppReducerState,
    action: changePlanViewStateAction
  ): AppReducerState {
    return update(state, {
      planViewState: {
        $set: action.payload
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

export const initialState: AppReducerState = {
  planViewState: 'init',
  searchingOnMap: false
}
