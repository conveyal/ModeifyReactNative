// @flow

export const reducers = {
  'LOCATION_FIELD_FOCUS' () {
    return {
      locationFieldHasFocus: true
    }
  },
  'LOCATION_FIELD_BLUR' () {
    return {
      locationFieldHasFocus: false
    }
  }
}


export const initialState = {
  locationFieldHasFocus: false
}
