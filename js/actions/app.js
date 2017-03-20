// @flow

import { createAction } from 'redux-actions'

export const appStateChange = createAction('CHANGE_APP_STATE')
export const blurLocationField = createAction('LOCATION_FIELD_BLUR')
export const focusLocationField = createAction('LOCATION_FIELD_FOCUS')
