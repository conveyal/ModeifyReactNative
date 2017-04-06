// @flow

import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {createAction} from 'redux-actions'

export const appStateChange = createAction('CHANGE_APP_STATE')
export const blurLocationField = createAction('LOCATION_FIELD_BLUR')
export const focusLocationField = createAction('LOCATION_FIELD_FOCUS')
export const changePlanPostpressSetting = createAction('CHANGE_PLAN_POSTPROCESS_SETTING')

export function focusToLocationSelection () {
  return [
    focusLocationField(),
    appStateChange('location-selection')
  ]
}

/**
 * Actions to perform upon hitting a close button.
 *
 * Actions depend on what view called back
 */
export function back (currentAppState: string) {
  switch (currentAppState) {
    case 'location-selection':
      return close()
    case 'results-list':
      return appStateChange('location-selection')
    case 'settings':
      return appStateChange('results-list')
    default:
      break
  }
}

/**
 * Actions to perform upon hitting a close button.
 *
 * Clears 'to location', sets 'from location' back to 'Current Location' and
 * changes app state to 'home'
 */
export function close () {
  return [
    setLocation({
      type: 'from',
      location: {
        name: 'Current Location',
        currentLocation: true
      }
    }),
    clearLocation({ type: 'to' }),
    blurLocationField(),
    appStateChange('home')
  ]
}
