// @flow

import {toLatFirstString} from '@conveyal/lonlat'
import createOtpReducer from 'otp-react-redux/lib/reducers/create-otp-reducer'
import qs from 'qs'
import {handleActions} from 'redux-actions'

import * as locationSelection from './location-selection'
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

export default {
  locationSelection: handleActions(locationSelection.reducers, locationSelection.initialState),
  otp: createOtpReducer(otpConfig),
  user: handleActions(user.reducers, user.initialState)
}
