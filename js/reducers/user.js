// @flow

import type UserReducerState from '../types/reducers'

export const reducers = {
  'log out' (state: UserReducerState) {
    return {}
  },
  'set auth0 user' (state: UserReducerState, action: {
    payload: Object,
    type: string
  }) {
    return {
      ...state,
      ...action.payload
    }
  },
  'set id token' (state: UserReducerState, action: {
    payload: string,
    type: string
  }) {
    return {
      ...state,
      idToken: action.payload
    }
  }
}

export const initialState: UserReducerState = {}
