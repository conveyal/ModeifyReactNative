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
  setModeString(option)
  calculateMinutes(option)

  return option
}

function calculateMinutes (option) {
  let averageTime
  if (hasTransit(option) || !hasCar(option)) {
    averageTime = Math.round(option.time / 60)
  } else {
    averageTime = Math.round(option.time / 60 * 1.35)
  }
  option.averageTime = averageTime
}

function hasCar (option) {
  return option.modes.indexOf('car') !== -1
}

function hasTransit (option) {
  return option.transit ? option.transit.length > 0 : false
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
      if (hasTransit(option)) {
        modeStr = 'drive'
      } else {
        modeStr = 'carpool/vanpool'
      }
      break
    case 'walk':
      if (!hasTransit(option)) {
        modeStr = 'walk'
      }
      break
  }

  if (hasTransit(option)) {
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

  let accessMode = option.access()[0].mode.toLowerCase()

  // style a park-and-ride access mode the same as a regular car trip
  if (accessMode === 'car_park') accessMode = 'car'

  let accessModeIcon = convert.modeToIcon(accessMode)
  const egress = option.egress()
  let segments = []
  const transitSegments = option.transit ? option.transit : []

  if (transitSegments.length < 1 && accessMode === 'car') {
    accessModeIcon = convert.modeToIcon('carshare')
  }

  segments.push({
    mode: accessModeIcon,
    inline: !!segmentOptions.inline,
    small: !!segmentOptions.small,
    svg: true
  })

  segments = segments.concat(transitSegments.map(function (segment) {
    const patterns = segment.segmentPatterns.filter(patternFilter('color'))
    let background = patterns[0].color

    if (patterns.length > 0) {
      let percent = 0
      const increment = 1 / patterns.length * 100
      background = 'linear-gradient(to right'
      for (let i = 0; i < patterns.length; i++) {
        const color = patterns[i].color
        background += ',' + color + ' ' + percent + '%, ' + color + ' ' + (percent + increment) + '%'
        percent += increment
      }
      background += ')'
    }

    return {
      background: background,
      mode: convert.modeToIcon(segment.mode),
      inline: !!segmentOptions.inline,
      small: !!segmentOptions.small,
      shortName: patterns[0].shield,
      longName: patterns[0].longName || patterns[0].shield
    }
  }))

  if (egress && egress.length > 0) {
    const egressMode = egress[0].mode.toLowerCase()
    if (egressMode !== 'walk') {
      segments.push({
        mode: convert.modeToIcon(egressMode),
        inline: !!segmentOptions.inline,
        small: !!segmentOptions.small,
        svg: true
      })
    }
  }

  option.segments = segments
}
