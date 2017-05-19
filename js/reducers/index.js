// @flow

import createOtpReducer from 'otp-react-redux/lib/reducers/create-otp-reducer'
import qs from 'qs'
import {handleActions} from 'redux-actions'

import * as app from './app'
import * as user from './user'
import {mphToMps, safeParseFloat, safeParseInt} from '../util/convert'

import type {AppConfig, RequestApi} from '../types'
import type {CurrentQuery} from '../types/reducers'

const appConfig: AppConfig = require('../../config.json')
appConfig.customOtpQueryBuilder = (
  api: RequestApi,
  query: CurrentQuery
) => {
  const planEndpoint: string = `${api.host}${api.path}`
  const {date, from, mode, time, to} = query

  // calculate modes
  const accessModes: string[] = ['WALK']
  const directModes: string[] = []
  const egressModes: string[] = ['WALK']
  const transitModes: string[] = []

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
    bikeSpeed: mphToMps(safeParseFloat(mode.settings.bikeSpeed, 8)),
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
    walkSpeed: mphToMps(safeParseFloat(mode.settings.walkSpeed, 3))
  }
  const url: string = `${planEndpoint}?${qs.stringify(params)}`
  console.log(url)
  return url
}

const initialOtpQuery: CurrentQuery = {
  from: {
    currentLocation: true,
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
  }
}

export default {
  app: handleActions(app.reducers, app.initialState),
  nav: {},
  otp: createOtpReducer(appConfig, initialOtpQuery),
  user: handleActions(user.reducers, user.initialState)
}
