// @flow

import isEqual from 'lodash.isequal'
import ProfileScorer from 'otp-profile-score'
import toSentenceCase from 'to-sentence-case'

import convert from './convert'

import type TripPlanResult from '../types/results'

const scorer = new ProfileScorer()

type RouteResultConfig = {

}

export default class RouteResult {
  fromLocation: Object;
  lastResponse: Object;
  results: TripPlanResult;
  toLocation: Object;

  hasChanged = false
  hasError = false

  constructor (config?: RouteResultConfig) {

  }

  lastResponse = {}

  getResults () {
    if (this.hasError || !this.lastResponse) return []

    return scorer.processOptions(this.lastResponse.r5.profile)
      .map((option) => addModeifyData(option))
  }

  getSegmentDetailsForOption (option: Object) {
    if (option.segmentDetails) {
      return option.segmentDetails
    }

    let segments = []

    // add from location
    segments.push({
      description: this.fromLocation.name,
      icon: {
        modeifyIcon: true,
        name: 'start'
      },
      iconColor: '#8ec449',
      rowStyle: {
        backgroundColor: '#fff'
      },
      textStyle: {
        fontWeight: 'bold'
      }
    })

    segmentRowIdx = 1

    segments = segments.concat(
      narrativeDirections(option.access[0].streetEdges, segmentRowIdx)
    )

    // Add transit segments
    let lastColor = ''
    const transitSegments = option.transit || []
    const length = transitSegments.length
    for (let i = 0; i < length; i++) {
      const segment = transitSegments[i]
      const departureTimes = segment.departureTimes || []
      const fromName = segment.fromName
      const patterns = segment.segmentPatterns
      const color = patterns[0].color
      const routeAgencyNames = {}
      segment.routes.forEach((route) => {
        routeAgencyNames[route.id] = route.agencyName
      })

      // Check for a walking distance to see if you are boarding or transferring
      if (segment.walkTime !== 0 || i === 0) {
        if (i > 0) {
          segments.push(setRowStyle({
            description: 'Walk ' + (Math.ceil(segment.walkTime / 60) + 1) + ' min',
            icon: {
              materialIcon: true,
              name: 'walk'
            }
          }))
        }

        // board
        segments.push(setRowStyle({
          description: fromName,
          icon: {
            materialIcon: true,
            name: 'checkbox-blank-circle'
          },
          routeStyle: {
            board: true,
            color
          },
          textStyle: {
            fontWeight: 'bold'
          }
        }))
      } else {
        // transfer at same stop
        segments.push(setRowStyle({
          description: fromName,
          icon: {
            materialIcon: true,
            name: 'checkbox-blank-circle'
          },
          routeStyle: {
            color,
            lastColor,
            transfer: true
          },
          textStyle: {
            fontWeight: 'bold'
          }
        }))
      }

      segments.push(setRowStyle({
        description: 'Take ' + getRouteNames(segment.routes),
        routeStyle: {
          take: true,
          color
        },
        segment: true
      }))

      // Check if you are deboarding
      if (i + 1 >= length || transitSegments[i + 1].walkTime > 0) {
        segments.push(setRowStyle({
          description: segment.toName,
          icon: {
            materialIcon: true,
            name: 'checkbox-blank-circle'
          },
          routeStyle: {
            alight: true,
            lastColor: color
          },
          textStyle: {
            fontWeight: 'bold'
          }
        }))
      }

      lastColor = color
    }

    if (option.egress && option.egress.length > 0) {
      segments = segments.concat(
        narrativeDirections(option.egress[0].streetEdges)
      )
    }

    // add to location
    segments.push({
      description: this.toLocation.name,
      icon: {
        modeifyIcon: true,
        name: 'end'
      },
      iconColor: '#f5a81c',
      rowStyle: {
        backgroundColor: '#fff'
      },
      textStyle: {
        fontWeight: 'bold'
      }
    })

    option.segmentDetails = segments

    return option.segmentDetails
  }

  /**
   * parse a new profile response
   * @param  {Object} response A trip plan profile data
   * @return {boolean}         True if the response should cause an update
   */
  parseResponse (response: TripPlanResult) {
    if (isEqual(response, this.lastResponse)) {
      return
    }

    this.hasChanged = true
    this.lastResponse = response

    if (response && response.error) {
      this.hasError = true
    } else {
      this.hasError = false
    }
  }

  setLocation (type: 'from' | 'to', location: Object) {
    if (type === 'from') {
      if (this.fromLocation !== location) this.hasChanged = true
      this.fromLocation = location
    } else {
      if (this.toLocation !== location) this.hasChanged = true
      this.toLocation = location
    }
  }

  setScorerRate (setting: string, value: any) {
    value = parseFloat(value)
    if (scorer.rates[setting] === value) return
    scorer.rates[setting] = value
    this.hasChanged = true
  }
}

let segmentRowIdx

const MODE_TO_ACTION = {
  BICYCLE: 'Bike',
  BICYCLE_RENT: 'Bike',
  CAR: 'Drive',
  CAR_PARK: 'Drive',
  WALK: 'Walk'
}

const MODE_TO_ICON = {
  BICYCLE: {
    materialIcon: true,
    name: 'bike'
  },
  BICYCLE_RENT: {
    modeifyIcon: true,
    name: 'cabi'
  },
  CAR: {
    materialIcon: true,
    name: 'car'
  },
  CAR_PARK: {
    materialIcon: true,
    name: 'car'
  },
  WALK: {
    materialIcon: true,
    name: 'walk'
  }
}

const DIRECTION_TO_CARDINALITY = {
  CIRCLE_COUNTERCLOCKWISE: 'repeat',
  HARD_LEFT: 'arrow-left',
  HARD_RIGHT: 'arrow-right',
  RIGHT: 'arrow-right',
  LEFT: 'arrow-left',
  CONTINUE: 'arrow-up',
  SLIGHTLY_RIGHT: 'arrow-right',
  SLIGHTLY_LEFT: 'arrow-right',
  UTURN_LEFT: 'repeat',
  UTURN_RIGHT: 'repeat'
}

const DIRECTION_TO_CARDINALITY_TRANSFORM = {
  CIRCLE_COUNTERCLOCKWISE: 'fa-repeat fa-flip-horizontal',
  SLIGHTLY_RIGHT: 'fa-arrow-right fa-northeast',
  SLIGHTLY_LEFT: 'fa-arrow-right fa-northwest',
  UTURN_LEFT: 'fa-repeat fa-flip-horizontal'
}

function addModeifyData (option) {
  setModePresence(option)
  setModeString(option)
  setSegments(option)
  setDistances(option)
  setCost(option)
  setTimes(option)

  return option
}

function distances (option, mode, val) {
  if (option.modes.indexOf(mode) === -1) {
    return false
  } else {
    return convert.metersToMiles(option[val])
  }
}

function getAgencyName (internalName) {
  switch (internalName) {
    case 'MET': return 'Metro'
    case 'Arlington Transit': return 'ART'
    case 'Maryland Transit Administration': return 'MTA'
    case 'Potomac and Rappahannock Transportation Commission': return 'PRTC'
    case 'Virginia Railway Express': return 'VRE'
    case 'Montgomery County MD Ride On': return 'Ride On'
    case 'Alexandria Transit Company (DASH)': return 'DASH'
  }
  return internalName
}

function getRouteNames (routes) {
  var agencyRoutes = {} // maps agency name to array of routes
  routes.forEach(function (r) {
    var agencyName = r.agencyName
    // FIXME: fix this in the R5 response
    if (!agencyName || agencyName === 'UNKNOWN') {
      agencyName = r.id.split(':')[0]
      agencyName = agencyName.substring(0, agencyName.length - 54)
    }
    if (!(agencyName in agencyRoutes)) {
      agencyRoutes[agencyName] = []
    }
    agencyRoutes[agencyName].push(r)
  })
  var agencyStrings = []
  for (var agencyName in agencyRoutes) {
    var rtes = agencyRoutes[agencyName]
    // TODO: handle DC-specific behavior via config
    var displayName = (agencyName === 'MET' || agencyName === 'WMATA')
      ? rtes[0].mode === 'SUBWAY'
        ? 'Metrorail'
        : 'Metrobus'
      : getAgencyName(agencyName)
    displayName = displayName.replace('_', ' ') // FIXME: shouldn't be necessary after R5 API fix
    agencyStrings.push(displayName + ' ' + rtes.map(function (r) { return r.shortName }).join('/'))
  }
  return agencyStrings.join(', ')
}

function narrativeDirections (edges) {
  if (!edges) return []

  const narrative = []

  edges.forEach((streetEdge) => {
    if (!streetEdge.streetName && !streetEdge.bikeRentalOffStation) {
      return
    }

    const linkOrPath = streetEdge.streetName === 'Link' ||
      streetEdge.streetName === 'Path'
    if (linkOrPath || streetEdge.relativeDirection === 'CONTINUE') {
      return
    }

    const streetSuffix = ' on ' + streetEdge.streetName
    const step = {}
    if (streetEdge.bikeRentalOnStation) {
      step.description = 'Rent bike from ' +
        streetEdge.bikeRentalOnStation.name +
        ' and ride ' +
        streetEdge.absoluteDirection.toLowerCase() +
        streetSuffix
      step.icon = {
        modeifyIcon: true,
        name: 'cabi'
      }
    } else if (streetEdge.bikeRentalOffStation) {
      step.description = 'Park bike at ' + streetEdge.bikeRentalOffStation.name
      step.icon = {
        modeifyIcon: true,
        name: 'cabi'
      }
    } else if (streetEdge.mode) {
      step.description = MODE_TO_ACTION[streetEdge.mode] +
        ' ' +
        streetEdge.absoluteDirection.toLowerCase() +
        streetSuffix
      step.icon = MODE_TO_ICON[streetEdge.mode]
    } else {
      step.description = toSentenceCase(streetEdge.relativeDirection) + streetSuffix
      step.icon = {
        fontAwesome: true,
        name: DIRECTION_TO_CARDINALITY[streetEdge.relativeDirection],
        transform: DIRECTION_TO_CARDINALITY_TRANSFORM[streetEdge.relativeDirection]
      }
    }

    setRowStyle(step)

    narrative.push(step)
  })

  return narrative
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

function setCost (option) {
  if (option.cost === 0) {
    return
  }

  let cost = 0
  if (option.transitCost) {
    cost += option.transitCost
  }
  if (option.hasCar) {
    cost += scorer.rates.mileageRate * option.driveDistances
    cost += scorer.rates.carParkingCost
  }

  option.costPerTrip = cost.toFixed(2)
}

function setDistances (option) {
  option.driveDistances = distances(option, 'car', 'driveDistance')

  option.bikeDistances = distances(option, 'bicycle', 'bikeDistance') ||
    distances(option, 'bicycle_rent', 'bikeDistance')

  option.walkDistances = distances(option, 'walk', 'walkDistance')
}

function setModePresence (option) {
  option.hasCar = option.modes.indexOf('car') !== -1
  option.hasTransit = option.transit ? option.transit.length > 0 : false
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

function setRowStyle (step: Object) {
  step.rowStyle = {
    backgroundColor: segmentRowIdx % 2 ? '#edeff0' : '#fff'
  }
  segmentRowIdx++
  return step
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
