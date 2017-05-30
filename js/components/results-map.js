// @flow

import polyline from 'polyline'
import React, { Component } from 'react'
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MapView from 'react-native-maps'

import DumbTextButton from './dumb-text-button'
import ModeifyIcon from './modeify-icon'
import {constructMapboxUrl} from '../util'

import type {AppConfig, MapRegion} from '../types'
import type {CurrentQuery, Location} from '../types/query'
import type {PlanSearch} from '../types/reducers'
import type {
  BikeRentalStation,
  NonTransitModeDetails,
  NonTransitProfile,
  Pattern,
  Stop,
  StreetEdge,
  TransitModeDetails,
  TransitProfile,
  TripPlanResponse,
  TripPlanResult
} from '../types/results'
import type {styleOptions} from '../types/rn-style-config'

const config: AppConfig = require('../../config.json')

type BooleanLookup = { [key: string]: boolean }
type Coordinate = [number, number]
type MarkerCoordinate = {
  latitude: ?number,
  longitude: ?number
}

type Props = {
  activeSearch: number,
  changePlanViewState: (string) => void,
  fromLocation: Location,
  planViewState: string,
  searchingOnMap: boolean,
  searches: PlanSearch[],
  toLocation: Location
}

export default class ResultsMap extends Component {
  props: Props

  componentDidUpdate () {
    if (this.refs.resultsMap && (this.props.fromLocation || this.props.toLocation)) {
      this.refs.resultsMap.fitToElements(true)
    }
  }

  // --------------------------------------------------
  // handlers
  // --------------------------------------------------

  _onExpandMap = () => {
    this.props.changePlanViewState('result-summarized')
  }

  // --------------------------------------------------
  // renderers
  // --------------------------------------------------

  _renderCollapsedMap (): ?React.Element<*> {
    return (
      <TouchableOpacity
        onPress={this._onExpandMap}
        style={styles.collapsedMapContainer}
        >
        <DumbTextButton
          backgroundColor='#F5A729'
          color='#fff'
          text='VIEW MAP'
          />
      </TouchableOpacity>
    )
  }

  _renderLocationMarker = (location: Location, type: string): ?React.Element<*> => {
    if(hasCoords(location)) {
      let color: string
      let name: string

      if(type === 'from') {
        color = '#8ec449'
        name = 'start'
      } else {
        color = '#f5a81c'
        name = 'end'
      }

      return (
        <MapView.Marker
          coordinate={toLatLng(location)}
          title={location.name}
          zIndex={500}
          >
          <ModeifyIcon
            color={color}
            name={name}
            size={30}
            />
        </MapView.Marker>
      )
    }
  }

  _renderTripPlanResult = (): Array<React.Element<*>> | React.Element<*> | null => {
    const {activeSearch, searches} = this.props

    if (searches.length === 0 || activeSearch === null) {
      return null
    }

    const itemsToRender: Array<React.Element<*>> = []
    const polylineKeys: BooleanLookup = {}
    const stopKeys: BooleanLookup = {}
    const cabiStationKeys: BooleanLookup = {}

    if (!searches[activeSearch].planResponse ||
      !searches[activeSearch].planResponse.r5 ||
      !searches[activeSearch].planResponse.r5.profile) {
      console.warn('Unparseable plan response', searches[activeSearch].planResponse)
      return null
    }

    function addCabiStationIfNeeded (station: ?BikeRentalStation) {
      if (!station || cabiStationKeys[station.id]) return
      cabiStationKeys[station.id] = true

      itemsToRender.push(
        <MapView.Marker
          coordinate={toLatLng(station)}
          key={station.id}
          title={station.name}
          zIndex={500}
          >
          <View
            style={styles.cabiMarkerContainer}
            >
            <ModeifyIcon
              color='#FFCB00'
              name='cabi'
              size={12}
              style={styles.cabiMarker}
              />
          </View>
        </MapView.Marker>
      )
    }

    function addPolylineIfNeeded (
      mode: string,
      polylineCoords: Coordinate[],
      polylineStyle: styleOptions
    ) {
      const encodedPolyline = polyline.encode(polylineCoords)
      const polylineKey = `${mode}-${encodedPolyline}`

      // don't add duplicate polylines
      if (polylineKeys[polylineKey]) return

      // not duplicate, add
      polylineKeys[polylineKey] = true

      itemsToRender.push(
        <MapView.Polyline
          key={polylineKey}
          coordinates={polylineCoords.map((
            coord: Coordinate
          ): MarkerCoordinate[] => ({
            latitude: coord[0],
            longitude: coord[1]
          }))}
          {...getPolylineStylesForMode(mode, polylineStyle)}
          zIndex={400}
          />
      )
    }

    function addStopMarkerIfNeeded (stop: Stop) {
      if (stopKeys[stop.stop_id]) return
      stopKeys[stop.stop_id] = true
      itemsToRender.push(
        <MapView.Marker
          coordinate={{
            latitude: stop.stop_lat,
            longitude: stop.stop_lon
          }}
          image={require('../../assets/stop-dot.png')}
          key={stop.stop_id}
          title={stop.stop_name}
          zIndex={500}
          />
      )
    }

    function streetEdgesToCoordinates (streetEdges: Array<StreetEdge>) {
      let combinedLineCoordinates: Coordinate[] = []
      streetEdges.forEach((edge: StreetEdge) => {
        addCabiStationIfNeeded(edge.bikeRentalOffStation)
        addCabiStationIfNeeded(edge.bikeRentalOnStation)
        combinedLineCoordinates = combinedLineCoordinates
          .concat(polyline.decode(edge.geometry.points))
      })
      return combinedLineCoordinates
    }

    const r5Response: TripPlanResult = searches[activeSearch].planResponse.r5

    r5Response.profile.forEach((
      profile: TransitProfile | NonTransitProfile,
      idx: number
    ) => {
      function addAccessOrEggressModes (accessOrEgress: NonTransitModeDetails[]) {
        accessOrEgress.forEach((modeOption: NonTransitModeDetails) => {
          if (!getPolylineStylesForMode(modeOption.mode)) return
          addPolylineIfNeeded(
            modeOption.mode,
            streetEdgesToCoordinates(modeOption.streetEdges)
          )
        })
      }
      if (profile.summary === 'Non-transit options') {
        // non-transit
        addAccessOrEggressModes(profile.access)
      } else if (profile.transit) {
        addAccessOrEggressModes(profile.access)
        profile.transit.forEach((transitOption: TransitModeDetails) => {
          const coords: Coordinate[] = []
          const firstSegmentPattern: Pattern = transitOption.segmentPatterns[0]
          const patternData: Pattern = r5Response.patterns.find((
            pattern: Pattern
          ): boolean =>
            pattern.pattern_id === firstSegmentPattern.patternId
          )

          // create polyline using stops
          // also add markers for board and alight stops
          for (let i = firstSegmentPattern.fromIndex; i <= firstSegmentPattern.toIndex; i++) {
            const stop: Stop = r5Response.stops.find(
              (stop: Stop) => stop.stop_id === patternData.stops[i].stop_id
            )
            coords.push([stop.stop_lat, stop.stop_lon])
            if (i === firstSegmentPattern.fromIndex || i === firstSegmentPattern.toIndex) {
              addStopMarkerIfNeeded(stop)
            }
          }
          addPolylineIfNeeded(
            transitOption.mode,
            coords,
            {
              strokeColor: firstSegmentPattern.color
            }
          )
        })
        addAccessOrEggressModes(profile.egress)
      }
    })

    return itemsToRender
  }

  render (): ?React.Element<*> {
    const {fromLocation, planViewState, searchingOnMap, toLocation} = this.props
    if (searchingOnMap) return null  // temp fix for https://github.com/airbnb/react-native-maps/issues/453

    const screenHeight: number = Dimensions.get('window').height
    let curMapHeight: number = 0

    switch (planViewState) {
      case 'init':
        curMapHeight = screenHeight - 112
        break
      case 'result-collapsed':
        curMapHeight = screenHeight - 323
        break
      case 'result-summarized':
        curMapHeight = screenHeight - 250
        break
      case 'result-expanded':
        return this._renderCollapsedMap()
    }

    return (
      <View style={{height: curMapHeight}}>
        <MapView
          initialRegion={config.map.initialRegion}
          ref='resultsMap'
          style={styles.map}
          >
          {config.map.showMapBoxTiles &&
            <MapView.UrlTile
              urlTemplate={constructMapboxUrl(config.map.mapbox_base_style)}
              />
          }
          {config.map.showMapBoxTiles &&
            <MapView.UrlTile
              urlTemplate={constructMapboxUrl(config.map.mapbox_label_style)}
              />
          }
          {this._renderLocationMarker(fromLocation, 'from')}
          {this._renderLocationMarker(toLocation, 'to')}
          {this._renderTripPlanResult()}
        </MapView>
      </View>
    )
  }
}

const polylineStyles: { [key: string]: styleOptions } = {
  BICYCLE: {
    lineDashPattern: [10, 10],
    strokeColor: '#ef3026',
    strokeWidth: 3
  },
  BICYCLE_RENT: {
    lineDashPattern: [10, 10],
    strokeColor: '#ef3026',
    strokeWidth: 3
  },
  BUS: {
    strokeWidth: 5
  },
  CAR: {
    lineDashPattern: [10, 10],
    strokeColor: '#888',
    strokeWidth: 3
  },
  CAR_PARK: {
    lineDashPattern: [10, 10],
    strokeColor: '#888',
    strokeWidth: 3
  },
  RAIL: {
    strokeWidth: 8
  },
  SUBWAY: {
    strokeWidth: 8
  },
  WALK: {
    lineDashPattern: [3, 3],
    strokeColor: '#0BC8F4',
    strokeWidth: 3
  }
}

function getPolylineStylesForMode (
  mode: string,
  overrides: styleOptions = {}
): styleOptions {
  if (!polylineStyles[mode]) {
    console.warn(`unrecognized access/egress mode: ${mode}`)
    return
  }

  return Object.assign({}, polylineStyles[mode], overrides)
}

function hasCoords(location: Location): boolean {
  return location &&
    (typeof location.lat === 'number') &&
    (typeof location.lon === 'number')
}

function toLatLng (location: Location): MarkerCoordinate {
  return {
    latitude: location.lat,
    longitude: location.lon
  }
}

type ResultMapStyle = {
  cabiMarker: styleOptions,
  cabiMarkerContainer: styleOptions,
  collapsedMapContainer: styleOptions,
  map: styleOptions
}

const resultMapStyle: ResultMapStyle = {
  cabiMarker: {
    left: 2,
    position: 'absolute',
    top: 1
  },
  cabiMarkerContainer: {
    backgroundColor: '#EF3026',
    borderColor: '#FFCB00',
    borderRadius: 15,
    borderWidth: 2,
    height: 20,
    overflow: 'hidden',
    width: 20
  },
  collapsedMapContainer: {
    alignItems: 'center',
    backgroundColor: '#999999',
    padding: 10
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  }
}

const styles: ResultMapStyle = StyleSheet.create(resultMapStyle)
