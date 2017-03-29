// @flow

import isEqual from 'lodash.isequal'
import ProfileScorer from 'otp-profile-score'

import convert from './convert'

import type TripPlanResult from '../types/results'

const scorer = new ProfileScorer()

type RouteResultConfig = {

}

export default class RouteResult {
  hasError: boolean;
  lastResponse: TripPlanResult;
  results: TripPlanResult;

  constructor (config?: RouteResultConfig) {

  }

  /**
   * parse a new profile response
   * @param  {Object} response A trip plan profile data
   * @return {boolean}         True if the response should cause an update
   */
  parseResponse (response: TripPlanResult) {
    if (isEqual(response, this.lastResponse)) {
      return false
    }

    this.lastResponse = response
    if (response.error) {
      this.hasError = true
      this.results = []
      return true
    }
    this.results = scorer.processOptions(response.r5.profile)
      .map((option) => addModeifyData(option))

    console.log(this.results.slice(4))

    return true
  }
}

function addModeifyData (option) {
  calculateModePresence(option)
  setModeString(option)
  setSegments(option)
  setDistances(option)
  setTimes(option)

  return option
}

function calculateModePresence (option) {
  option.hasCar = option.modes.indexOf('car') !== -1
  option.hasTransit = option.transit ? option.transit.length > 0 : false
}

function distances (option, mode, val) {
  if (option.modes.indexOf(mode) === -1) {
    return false
  } else {
    return convert.metersToMiles(option[val])
  }
}

function patternFilter (by) {
  by = by || 'shortName'
  const names = []
  return function (p) {
    if (by === 'shortName') {
      p.shortName = p.shortName || p.longName
    }

    if (names.indexOf(p[by]) === -1) {
      names.push(p[by])
      return true
    } else {
      return false
    }
  }
}

function setDistances (option) {
  option.driveDistances = distances(option, 'car', 'driveDistance')

  option.bikeDistances = distances(option, 'bicycle', 'bikeDistance') ||
    distances(option, 'bicycle_rent', 'bikeDistance')

  option.walkDistances = distances(option, 'walk', 'walkDistance')
}

function setModeString (option) {
  let modeStr = ''
  const accessMode = option.access[0].mode.toLowerCase()
  const egressMode = option.egress ? option.egress[0].mode.toLowerCase() : false

  switch (accessMode) {
    case 'bicycle_rent':
      modeStr = 'bikeshare'
      break
    case 'bicycle':
      modeStr = 'bike'
      break
    case 'car':
      if (option.hasTransit) {
        modeStr = 'drive'
      } else {
        modeStr = 'carpool/vanpool'
      }
      break
    case 'walk':
      if (!option.hasTransit) {
        modeStr = 'walk'
      }
      break
  }

  if (option.hasTransit) {
    if (modeStr.length > 0) modeStr += ' to '
    modeStr += 'transit'
  }

  if (egressMode && egressMode !== 'walk') {
    modeStr += ' to '
    switch (egressMode) {
      case 'bicycle_rent':
        modeStr += 'bikeshare'
        break
    }
  }

  option.modeDescriptor = modeStr
}

function setSegments (option, segmentOptions) {
  segmentOptions = segmentOptions || {}
  const inline = !!segmentOptions.inline
  const small = !!segmentOptions.small

  let accessMode = option.access[0].mode.toLowerCase()

  // style a park-and-ride access mode the same as a regular car trip
  if (accessMode === 'car_park') accessMode = 'car'

  let accessModeIcon = convert.modeToIcon(accessMode)
  const {egress} = option
  let segments = []
  const transitSegments = option.transit ? option.transit : []

  if (transitSegments.length < 1 && accessMode === 'car') {
    accessModeIcon = convert.modeToIcon('carshare')
  }

  segments.push({
    mode: accessModeIcon,
    inline,
    small,
    svg: true
  })

  segments = segments.concat(transitSegments.map(function (segment) {
    const patterns = segment.segmentPatterns.filter(patternFilter('color'))
    let background = [patterns[0].color]

    if (patterns.length > 0) {
      background = []
      for (let i = 0; i < patterns.length; i++) {
        background.push(patterns[i].color)
      }
    }

    return {
      background: background,
      mode: convert.modeToIcon(segment.mode),
      inline,
      small,
      shortName: patterns[0].shield,
      longName: patterns[0].longName || patterns[0].shield
    }
  }))

  if (egress && egress.length > 0) {
    const egressMode = egress[0].mode.toLowerCase()
    if (egressMode !== 'walk') {
      segments.push({
        mode: convert.modeToIcon(egressMode),
        inline,
        small,
        svg: true
      })
    }
  }

  option.segments = segments
}

function setTimes (option) {
  let averageTime
  if (option.hasTransit || !option.hasCar) {
    averageTime = Math.round(option.time / 60)
  } else {
    averageTime = Math.round(option.time / 60 * 1.35)
    option.freeflowTime = Math.round(option.time / 60)
  }
  option.averageTime = averageTime
  option.bikeTime = timeFromSpeedAndDistance(scorer.rates.bikeSpeed, option.bikeDistance)
  option.walkTime = timeFromSpeedAndDistance(scorer.rates.walkSpeed, option.walkDistance)
}

function timeFromSpeedAndDistance (s, d) {
  var t = d / s
  if (t < 60) {
    return '< 1'
  } else {
    return parseInt(t / 60, 10)
  }
}
