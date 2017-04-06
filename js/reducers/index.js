// @flow

import createOtpReducer from 'otp-react-redux/lib/reducers/create-otp-reducer'
import qs from 'qs'
import {handleActions} from 'redux-actions'

import * as app from './app'
import * as user from './user'
import {mphToMps} from '../util/convert'

function safeParseInt (value, defaultValue) {
  try {
    return parseInt(value, 10)
  } catch (e) {
    return defaultValue
  }
}

const otpConfig = require('../../config.json')
otpConfig.customOtpQueryBuilder = (api, query) => {
  const planEndpoint = `${api.host}${api.path}`
  const {date, from, mode, time, to} = query
  // calculate modes
  const accessModes = ['WALK']
  const directModes = []
  const egressModes = ['WALK']
  const transitModes = []

  if (mode.bike) {
    accessModes.push('BICYCLE')
    directModes.push('BICYCLE')
  }

  if (mode.bus) {
    transitModes.push('BUS')
  }

  if (mode.cabi) {
    accessModes.push('BICYCLE_RENT')
    directModes.push('BICYCLE_RENT')
    egressModes.push('BICYCLE_RENT')
  }

  if (mode.car) {
    accessModes.push('CAR_PARK')
    directModes.push('CAR')
  }

  if (mode.rail) {
    transitModes.push('TRAINISH')
  }

  if (mode.walk) {
    directModes.push('WALK')
  }

  const params = {
    accessModes: accessModes.join(','),
    bikeSafe: 1000,
    bikeSpeed: mphToMps(mode.settings.bikeSpeed),
    bikeTrafficStress: mode.settings.bikeTrafficStress,
    date,
    directModes: directModes.join(','),
    egressModes: egressModes.join(','),
    endTime: time.end,
    from,
    limit: 5,
    maxBikeTime: safeParseInt(mode.settings.maxBikeTime, 20),
    maxWalkTime: safeParseInt(mode.settings.maxWalkTime, 15),
    maxCarTime: 45,
    queryOtp: false,
    queryR5: true,
    startTime: time.start,
    to,
    transitModes: transitModes.join(','),
    walkSpeed: mphToMps(mode.settings.walkSpeed)
  }
  const url = `${planEndpoint}?${qs.stringify(params)}`
  console.log(url)
  return url
}

// const initialOtpQuery = {
//   from: {
//     currentLocation: true,
//     name: 'Current Location',
//   },
//   mode: {
//     bike: true,
//     bus: true,
//     cabi: true,
//     car: true,
//     rail: true,
//     settings: {
//       bikeSpeed: 8,
//       bikeTrafficStress: 4,
//       maxBikeTime: 20,
//       maxWalkTime: 15,
//       maxCarTime: 45,
//       walkSpeed: 3
//     },
//     walk: true
//   },
//   time: {
//     end: '9:00',
//     start: '7:00'
//   }
// }

const initialOtpQuery = {
  from: {
    currentLocation: true,
    lat: 38.88709,
    lon: -77.095229,
    name: 'Current Location',
  },
  mode: {
    bike: true,
    bus: true,
    cabi: true,
    car: true,
    rail: true,
    settings: {
      bikeSpeed: 8,
      bikeTrafficStress: 4,
      maxBikeTime: 20,
      maxWalkTime: 15,
      maxCarTime: 45,
      walkSpeed: 3
    },
    walk: true
  },
  time: {
    end: '9:00',
    start: '7:00'
  },
  to: {
    lat: 38.894757,
    lon: -77.071506,
    name: '1200 Wilson Blvd, Arlington, VA, USA'
  }
}

export default {
  app: handleActions(app.reducers, app.initialState),
  otp: createOtpReducer(otpConfig, initialOtpQuery),
  user: handleActions(user.reducers, user.initialState)
}
