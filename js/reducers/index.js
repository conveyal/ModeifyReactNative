// @flow

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
    bikeSafe: 1000,
    bikeSpeed: 3.57632,
    bikeTrafficStress: 4,
    date,
    directModes: 'WALK,BICYCLE,BICYCLE_RENT,CAR',
    egressModes: 'WALK,BICYCLE_RENT',
    endTime: time.end,
    from,
    limit: 5,
    maxBikeTime: 20,
    maxWalkTime: 15,
    maxCarTime: 45,
    queryOtp: false,
    queryR5: true,
    startTime: time.start,
    to,
    transitModes: 'BUS,TRAINISH',
    walkSpeed: 1.34112
  }
  const url = `${planEndpoint}?${qs.stringify(params)}`
  console.log(url)
  return url
}

const initialOtpQuery = {
  from: {
    name: 'Current Location',
    currentLocation: true
  },
  time: {
    end: '9:00',
    start: '7:00'
  }
}

export default {
  app: handleActions(app.reducers, app.initialState),
  otp: createOtpReducer(otpConfig, initialOtpQuery),
  user: handleActions(user.reducers, user.initialState)
}
