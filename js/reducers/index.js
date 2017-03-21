// @flow

import {toLatFirstString} from '@conveyal/lonlat'
import createOtpReducer from 'otp-react-redux/lib/reducers/create-otp-reducer'
import qs from 'qs'
import {handleActions} from 'redux-actions'

import * as app from './app'
import * as user from './user'

const otpConfig = require('../../config.json')
otpConfig.customOtpQueryBuilder = (api, query) => {
  const planEndpoint = `${api.host}${api.path}`
  const {date, from, mode, time, to} = query
  // TODO: handle mode
  const params = {
    accessModes: 'WALK,BICYCLE,BICYCLE_RENT,CAR_PARK',
    date,
    directModes: 'WALK,BICYCLE,BICYCLE_RENT,CAR',
    egressModes: 'WALK,BICYCLE_RENT',
    endTime: time.end,
    from: toLatFirstString(from),
    startTime: time.start,
    to: toLatFirstString(to),
    transitModes: 'BUS,TRAINISH'
  }
  return `${planEndpoint}?${qs.stringify(params)}`
}

const initialOtpQuery = {
  from: {
    name: 'Current Location',
    currentLocation: true
  }
}

export default {
  app: handleActions(app.reducers, app.initialState),
  otp: createOtpReducer(otpConfig, initialOtpQuery),
  user: handleActions(user.reducers, user.initialState)
}
