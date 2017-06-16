// @flow

import isEqual from 'lodash.isequal'
import ProfileScorer from 'otp-profile-score'
import toSentenceCase from 'to-sentence-case'

import convert from './convert'

import type {Location} from '../types/reducers'
import type {
  ModeifyResult,
  NonTransitModeDetails,
  NonTransitProfile,
  Pattern,
  Route,
  SegmentDetail,
  SegmentDisplay,
  StreetEdge,
  TransitModeDetails,
  TripPlanResponse,
  TripPlanResult,
  TransitProfile
} from '../types/results'
import type {styleOptions} from '../types/rn-style-config'

type Step = {
  description: string,
  icon?: {
    fontAwesome?: boolean,
    modeifyIcon?: boolean,
    name: string,
    transform?: string
  },
  rowStyle?: styleOptions
}

type StringLookup = {[key: string]: string}

const scorer = new ProfileScorer()

export default class RouteResult {
  fromLocation: Location
  lastResponse: TripPlanResponse
  _results: ?Array<ModeifyResult>
  toLocation: Location

  hasChanged = false
  hasError = false
  lastResponse = {}

  getBestOptionsByMode (): Array<ModeifyResult> {
    const modesSeen: {[key: string]: boolean} = {}
    return this.getResults()
      .filter((option: ModeifyResult): ModeifyResult => {
        if (modesSeen[option.dominantMode]) return false

        modesSeen[option.dominantMode] = true
        return true
      })
  }

  getResults (): Array<ModeifyResult> {
    if (this.hasError || !this.lastResponse || !this.lastResponse.r5) return []
    if (this._results) return this._results

    // console.log(this.lastResponse.r5.profile)
    const scoredOptions = scorer.processOptions(this.lastResponse.r5.profile)
    const driveOption = addModeifyData(scoredOptions.find(option =>
      option.access[0].mode === 'CAR' &&
      (!option.transit || option.transit.length < 1)))
    this._results = scoredOptions.map((option) => addModeifyData(option, driveOption))
    return this._results
  }

  /**
   * parse a new profile response
   * @param  {Object} response A trip plan profile data
   * @return {boolean}         True if the response should cause an update
   */
  parseResponse (response: TripPlanResult) {
    if (isEqual(response, this.lastResponse)) return

    this._setChanged()
    this.lastResponse = response

    if (response && response.error) {
      this.hasError = true
    } else {
      this.hasError = false
    }
  }

  _setChanged () {
    this.hasChanged = true
    this._results = null
  }

  setLocation (type: 'from' | 'to', location: Location) {
    if (type === 'from') {
      if (this.fromLocation !== location) this._setChanged()
      this.fromLocation = location
    } else {
      if (this.toLocation !== location) this._setChanged()
      this.toLocation = location
    }
  }

  setScorerRate (setting: string, value: any) {
    value = parseFloat(value)
    if (scorer.rates[setting] === value) return
    scorer.rates[setting] = value
    this._setChanged()
  }
}

let segmentRowIdx

const MODE_TO_ACTION: StringLookup = {
  BICYCLE: 'Bike',
  BICYCLE_RENT: 'Bike',
  CAR: 'Drive',
  CAR_PARK: 'Drive',
  WALK: 'Walk'
}

const MODE_TO_ICON: {
  [key: string]: {
    materialIcon?: boolean,
    modeifyIcon?: boolean,
    name: string
  }
} = {
  BICYCLE: {
    materialIcon: true,
    name: 'bike'
  },
  BICYCLE_RENT: {
    modeifyIcon: true,
    name: 'cabi'
  },
  CAR: {
    modeifyIcon: true,
    name: 'carshare'
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

const DIRECTION_TO_CARDINALITY: StringLookup = {
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

const DIRECTION_TO_CARDINALITY_TRANSFORM: StringLookup = {
  CIRCLE_COUNTERCLOCKWISE: 'fa-repeat fa-flip-horizontal',
  SLIGHTLY_RIGHT: 'fa-arrow-right fa-northeast',
  SLIGHTLY_LEFT: 'fa-arrow-right fa-northwest',
  UTURN_LEFT: 'fa-repeat fa-flip-horizontal'
}

function addModeifyData (
  option: NonTransitProfile | TransitProfile,
  driveOption: NonTransitProfile
) {
  if (!option) return  // might happen if results returned don't include driving
  setModePresence(option)
  setModeStrings(option)
  setSegments(option)
  setDistances(option)
  setCost(option)
  setTimes(option)
  setCarComparisonData(option, driveOption)

  return option
}

function distances (
  option: NonTransitProfile | TransitProfile,
  mode: string,
  val: string
): boolean | string {
  if (option.modes.indexOf(mode) === -1) {
    return false
  } else {
    return convert.metersToMiles(option[val])
  }
}

function getAgencyName (internalName: string): string {
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

function getRouteNames (routes: Array<Route>): string {
  var agencyRoutes: {
    [key: string]: Array<string>
  } = {} // maps agency name to array of routes
  routes.forEach((r: Route) => {
    let agencyName: string = r.agencyName
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

  const agencyStrings = []
  for (const agencyName in agencyRoutes) {
    const rtes = agencyRoutes[agencyName]
    // TODO: handle DC-specific behavior via config
    let displayName = (agencyName === 'MET' || agencyName === 'WMATA')
      ? rtes[0].mode === 'SUBWAY'
        ? 'Metrorail'
        : 'Metrobus'
      : getAgencyName(agencyName)
    displayName = displayName.replace('_', ' ') // FIXME: shouldn't be necessary after R5 API fix
    agencyStrings.push(displayName + ' ' + rtes.map((r: Route) => r.shortName).join('/'))
  }
  return agencyStrings.join(', ')
}

export function getOptionTags (
  option: NonTransitProfile | TransitProfile,
  fromLocation: Location,
  toLocation: Location
): Array<string> {
  let tags: Array<string> = []

  // add the access mode tags
  option.access.forEach((accessLeg: NonTransitModeDetails) => {
    if (accessLeg.mode === 'bicycle_rent') {
      tags.push('bicycle')
    }
    tags.push(accessLeg.mode)
  })

  // add a generic 'transit' tag and add tags for each transit leg
  if (option.hasTransit) {
    tags.push('transit')
    option.transit.forEach((transitLeg: TransitModeDetails) => {
      tags.push(transitLeg.mode) // add the transit mode tag
      if (transitLeg.routes.length > 0) { // add the agency tag
        tags.push(transitLeg.routes[0].id.split(':')[0])
      }
    })
  }

  // add tags for the from/to locations
  tags = tags.concat(locationToTags(fromLocation)).concat(locationToTags(toLocation))

  return tags.map(tag => tag.toLowerCase().trim())
}

export function getSegmentDetailsForOption (
  option: NonTransitProfile | TransitProfile,
  fromLocation: Location,
  toLocation: Location
): Array<SegmentDetail> {
  if (option.segmentDetails) {
    return option.segmentDetails
  }

  let segments: Array<SegmentDetail> = []

  // add from location
  segments.push({
    description: fromLocation.name,
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
    narrativeDirections(option.access[0].streetEdges)
  )

  // Add transit segments
  let lastColor = ''
  const transitSegments: Array<SegmentDetail> = option.transit || []
  const length = transitSegments.length
  for (let i = 0; i < length; i++) {
    const segment: SegmentDetail = transitSegments[i]
    const fromName: string = segment.fromName
    const patterns: Array<Pattern> = segment.segmentPatterns
    const color: string = patterns[0].color
    const routeAgencyNames = {}
    segment.routes.forEach((route: Route) => {
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
          stopImage: true
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
          stopImage: true
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
          stopImage: true
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
    description: toLocation.name,
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

function locationToTags (location: ?Location): Array<string> {
  if (!location) return []
  let locationName = location.name
  // strip off the zip code, if present
  var endsWithZip = /\d{5}$/
  if (endsWithZip.test(locationName)) {
    locationName = locationName.substring(0, locationName.length - 5)
  }
  return locationName.split(',').slice(1)
}

function narrativeDirections (edges: Array<StreetEdge>): Array<Step> {
  if (!edges) return []

  const narrative: Array<Step> = []

  edges.forEach((streetEdge: StreetEdge) => {

    let linkOrPath: boolean = false
    let streetSuffix: string = ''
    if (streetEdge.streetName) {
      linkOrPath = streetEdge.streetName === 'Link' ||
        streetEdge.streetName === 'Path'
      streetSuffix = ` on ${streetEdge.streetName}`
    } else if (!streetEdge.bikeRentalOnStation && !streetEdge.bikeRentalOffStation) {
      return
    }

    if (linkOrPath || streetEdge.relativeDirection === 'CONTINUE') {
      return
    }

    const step: Step = {
      description: ''
    }
    if (streetEdge.bikeRentalOnStation) {
      step.description = ['Rent bike from ',
        streetEdge.bikeRentalOnStation.name,
        ' and ride ',
        streetEdge.absoluteDirection.toLowerCase(),
        streetSuffix].join('')
      step.icon = {
        modeifyIcon: true,
        name: 'cabi'
      }
    } else if (streetEdge.bikeRentalOffStation) {
      step.description = `Park bike at ${streetEdge.bikeRentalOffStation.name}`
      step.icon = {
        modeifyIcon: true,
        name: 'cabi'
      }
    } else if (streetEdge.mode) {
      step.description = [MODE_TO_ACTION[streetEdge.mode],
        ' ',
        streetEdge.absoluteDirection.toLowerCase(),
        streetSuffix].join('')
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

function patternFilter (
  by?: 'color' | 'longName' | 'shield' | 'shortName'
): (Pattern) => boolean {
  by = by || 'shortName'
  const names = []
  return (pattern: Pattern): boolean => {
    if (by === 'shortName') {
      pattern.shortName = pattern.shortName || pattern.longName
    }

    if (names.indexOf(pattern[by]) === -1) {
      names.push(pattern[by])
      return true
    } else {
      return false
    }
  }
}

function setCarComparisonData (
  option: NonTransitProfile | TransitProfile,
  driveOption?: NonTransitProfile
) {
  let costDifference, emissions, timeSavings
  if (driveOption) {
    costDifference = driveOption.cost - option.cost
    emissions = (driveOption.emissions - option.emissions) / driveOption.emissions * 100
    timeSavings = (option.timeInTransit - (driveOption.time - option.time))

    if (option.directCar) {
      costDifference = driveOption.cost / 2
      emissions = 50
      timeSavings = option.averageTime / 2 // Assume split driving
    }

    if (costDifference > 0) {
      option.costSavings = costDifference
    }

    if (timeSavings > 0) {
      option.timeSavings = timeSavings / 60 / 60
    }

    if (emissions > 0) {
      option.emissionsDifference = emissions
    }
  }

  if (option.calories !== 0) {
    option.weightLost = convert.caloriesToPounds(option.calories)
  }
}

function setCost (option: NonTransitProfile | TransitProfile) {
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

function setDistances (option: NonTransitProfile | TransitProfile) {
  option.driveDistances = distances(option, 'car', 'driveDistance')

  option.bikeDistances = distances(option, 'bicycle', 'bikeDistance') ||
    distances(option, 'bicycle_rent', 'bikeDistance')

  option.walkDistances = distances(option, 'walk', 'walkDistance')
}

function setModePresence (option: NonTransitProfile | TransitProfile) {
  option.hasCar = option.modes.indexOf('car') !== -1
  option.hasTransit = option.transit ? option.transit.length > 0 : false
  option.directCar = option.modes.length === 1 && option.hasCar
}

function setModeStrings (option: NonTransitProfile | TransitProfile) {
  let modeStr: string = ''
  let dominantMode: string = ''
  let dominantModeIcon: string = ''
  const accessMode: string = option.access[0].mode.toLowerCase()
  const egressMode: string | boolean = option.egress
    ? option.egress[0].mode.toLowerCase()
    : false

  if (option.hasTransit) {
    dominantMode = 'transit'
    dominantModeIcon = convert.modeToIcon('rail')
  } else {
    switch (accessMode) {
      case 'bicycle_rent':
      case 'bicycle':
        dominantMode = 'bike'
        dominantModeIcon = convert.modeToIcon('bike')
        break
      case 'car':
        dominantMode = 'carpool/vanpool'
        dominantModeIcon = convert.modeToIcon('carshare')
        break
      case 'walk':
        dominantMode = 'walk'
        dominantModeIcon = convert.modeToIcon('walk')
        break
      default:
        console.error(`Unknown accessMode: ${accessMode}`)
        return false
    }
  }

  option.dominantMode = dominantMode
  option.dominantModeIcon = dominantModeIcon

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

function setRowStyle (step: Step) {
  step.rowStyle = {
    backgroundColor: segmentRowIdx % 2 ? '#edeff0' : '#fff'
  }
  segmentRowIdx++
  return step
}

function setSegments (option: NonTransitProfile | TransitProfile) {
  let accessMode: string = option.access[0].mode.toLowerCase()

  // style a park-and-ride access mode the same as a regular car trip
  if (accessMode === 'car_park') accessMode = 'car'

  let accessModeIcon: string = convert.modeToIcon(accessMode)
  const egress: ?NonTransitModeDetails = option.eggress
  let segments: Array<SegmentDisplay> = []
  const transitSegments: Array<TransitModeDetails> = option.transit ? option.transit : []

  if (transitSegments.length < 1 && accessMode === 'car') {
    accessModeIcon = convert.modeToIcon('carshare')
  }

  segments.push({
    mode: accessModeIcon
  })

  segments = segments.concat(transitSegments.map((segment: TransitModeDetails) => {
    const patterns: Array<TransitModeDetails> = segment.segmentPatterns.filter(
      patternFilter('color')
    )
    let background: Array<string> = [patterns[0].color]

    if (patterns.length > 0) {
      background = []
      for (let i = 0; i < patterns.length; i++) {
        background.push(patterns[i].color)
      }
    }

    return {
      background,
      mode: convert.modeToIcon(segment.mode),
      shortName: patterns[0].shield,
      longName: patterns[0].longName || patterns[0].shield
    }
  }))

  if (egress && egress.length > 0) {
    const egressMode = egress[0].mode.toLowerCase()
    if (egressMode !== 'walk') {
      segments.push({
        mode: convert.modeToIcon(egressMode)
      })
    }
  }

  option.segments = segments
}

function setTimes (option: NonTransitProfile | TransitProfile) {
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

function timeFromSpeedAndDistance (
  seconds: number,
  distance: number
): string {
  const time = distance / seconds
  if (time < 60) {
    return '< 1'
  } else {
    return '' + parseInt(time / 60, 10)
  }
}
