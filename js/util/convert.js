// @flow

/**
 * Calories to pounds
 */

exports.caloriesToPounds = function (cals: number): number {
  return cals / 3500
}

/**
 * Meters to miles
 */

exports.metersToMiles = function (meters: number): string {
  return milesToString(meters * 0.000621371)
}

/**
 * Miles to string
 */

const milesToString = exports.milesToString = function (miles: number): string {
  if (miles > 10) {
    return miles.toFixed(0)
  } else if (miles > 1) {
    return '' + ((miles * 10) | 0) / 10
  } else {
    return '' + ((miles * 100) | 0) / 100
  }
}

/**
 * MPH to m/s
 */

exports.mphToMps = function (mph: number): number {
  return mph * 0.44704
}

/**
 * TODO: this should be aliased in CSS
 */

exports.modeToIcon = function (mode: string): string {
  mode = mode || ''
  mode = mode.toLowerCase()
  switch (mode) {
    case 'bicycle':
      return 'bike'
    case 'bicycle_rent':
      return 'cabi'
    case 'pedestrian':
      return 'walk'
    case 'rail':
      return 'train'
    case 'subway':
      return 'subway-variant'
    default:
      return mode
  }
}

/**
 * Number to short string
 */

exports.roundNumberToString = function (number: number): string {
  if (number > 1000) {
    return toFixed(number, 0).toLocaleString()
  } else if (number > 100) {
    return '' + Math.round(number)
  } else if (number > 10) {
    return toFixed(number, 1)
  } else if (number > 1) {
    return toFixed(number, 2)
  }
  return ''
}

/**
 * Route to color converter
 */

exports.routeToColor = function (
  type: number,
  agency: string,
  line: string,
  color: string
): string {
  if (color) {
    return `#${color}`
  }

  if (agency === 'dc') {
    if (type === 1 || type === 'TRANSIT') return colors[line]
    return colors.metrobus
  }

  if (colors[agency]) {
    return colors[agency]
  }

  return '#333'
}

exports.safeParseFloat = function (
  value: number | string,
  defaultValue: number
): number {
  try {
    return parseFloat(value)
  } catch (e) {
    return defaultValue
  }
}

exports.safeParseInt = function (
  value: number | string,
  defaultValue: number
): number {
  try {
    return parseInt(value, 10)
  } catch (e) {
    return defaultValue
  }
}

/**
 * Seconds to minutes
 */

exports.secondsToMinutes = function (input: number): string {
  var minutes = Math.floor(input / 60)
  var sec = input % 60
  sec = sec < 10 ? '0' + sec : sec
  return minutes + ':' + sec
}

/**
 * To fixed without trailing zero
 */

const toFixed = exports.toFixed = function(
  number: number,
  decimalPlaces: number
): string {
  const temp = Math.pow(10, decimalPlaces)
  return '' + (((number * temp) | 0) / temp)
}

/**
 * Predefined Transit Colors
 */

var colors = {
  '1': '#55b848', // ART TODO: Dont have hacky agency
  'agency#1': '#55b848', // ART
  'agency#3': '#2c9f4b', // Maryland Commute Bus
  art: '#55b848',
  blue: '#0076bf',
  cabi: '#d02228',
  'fairfax connector': '#ffff43',
  green: '#00a84f',
  mcro: '#355997',
  metrobus: '#173964',
  orange: '#f7931d',
  prtc: '#5398a0',
  red: '#e21836',
  silver: '#a0a2a0',
  yellow: '#ffd200'
}

/*
  ART green #55b848
  Maryland green #2c9f4b
  Montgomery blue #355997
  Potomac blue #5398a0
  Fairfax yellow #faff4c
  Fairfax yellow type #c9b80d
  VRE red #de003a
  VRE blue #255393

  Metrobus #173964
  CaBI #d02228
  Metro Red #e21836
  Metro Orange #f7931d
  Metro Silver #a0a2a0
  Metro Blue #0076bf
  Metro Yellow #ffd200
  Metro Green #00a84f
*/
