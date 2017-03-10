// @flow

export const reducers = {
  'log out' (state: any, action: any) {
    return {}
  },
  'set auth0 user' (state: any, action: any) {
    return {
      ...state,
      ...action.payload
    }
  },
  'set id token' (state: any, action: any) {
    return {
      ...state,
      idToken: action.payload
    }
  }
}

export const initialState = {}
