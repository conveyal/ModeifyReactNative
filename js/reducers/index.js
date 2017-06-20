// @flow

import * as user from '@conveyal/woonerf/src/reducers/user'
import {handleActions} from 'redux-actions'

import * as app from './app'
import scoredResults from './scored-results'
import * as serviceAlerts from './serice-alerts'


function createReducer (reducer) {
  return handleActions(reducer.reducers, reducer.initialState)
}

export default {
  app: createReducer(app),
  nav: {},
  otp: scoredResults,
  serviceAlerts: createReducer(serviceAlerts),
  user: createReducer(user)
}
