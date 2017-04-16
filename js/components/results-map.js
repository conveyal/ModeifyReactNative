// @flow

import polyline from 'polyline'
import React, { Component } from 'react'
import {Platform, StyleSheet, Text, View} from 'react-native'
import MapView from 'react-native-maps'

import ModeifyIcon from './modeify-icon'
import {constructMapboxUrl} from '../util'

const config = require('../../config.json')

type Props = {
  activeSearch: number;
  searchingOnMap: boolean;
}

export default class ResultsMap extends Component {

  constructor(props: Props) {
    super(props)
  }

  componentDidUpdate () {
    if (this.refs.resultsMap && (this.props.fromLocation || this.props.toLocation)) {
      this.refs.resultsMap.fitToElements(true)
    }
  }

  // --------------------------------------------------
  // handlers
  // --------------------------------------------------



  // --------------------------------------------------
  // renderers
  // --------------------------------------------------

  _renderTripPlanResult = () => {
    const {activeSearch, searches} = this.props

    if (searches.length === 0 || activeSearch === null) {
      return null
    }

    const itemsToRender = []
    const polylineKeys = {}
    const stopKeys = {}
    const cabiStationKeys = {}

    if (!searches[activeSearch].planResponse ||
      !searches[activeSearch].planResponse.r5 ||
      !searches[activeSearch].planResponse.r5.profile) {
      console.warn('Unparseable plan response', searches[activeSearch].planResponse)
      return null
    }

    function addCabiStationIfNeeded (station) {
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

    function addPolylineIfNeeded (mode, polylineCoords, polylineStyle) {
      const encodedPolyline = polyline.encode(polylineCoords)
      const polylineKey = `${mode}-${encodedPolyline}`

      // don't add duplicate polylines
      if (polylineKeys[polylineKey]) return

      // not duplicate, add
      polylineKeys[polylineKey] = true

      itemsToRender.push(
        <MapView.Polyline
          key={polylineKey}
          coordinates={polylineCoords.map((coord) => ({
            latitude: coord[0],
            longitude: coord[1]
          }))}
          {...getPolylineStylesForMode(mode, polylineStyle)}
          zIndex={400}
          />
      )
    }

    function addStopMarkerIfNeeded (stop) {
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

    function streetEdgesToCoordinates (streetEdges) {
      let combinedLineCoordinates = []
      streetEdges.forEach((edge) => {
        addCabiStationIfNeeded(edge.bikeRentalOffStation)
        addCabiStationIfNeeded(edge.bikeRentalOnStation)
        combinedLineCoordinates = combinedLineCoordinates
          .concat(polyline.decode(edge.geometry.points))
      })
      return combinedLineCoordinates
    }

    const r5Response = searches[activeSearch].planResponse.r5

    r5Response.profile.forEach((profile, idx) => {
      function addAccessOrEggressModes (accessOrEgress) {
        accessOrEgress.forEach((modeOption) => {
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
        profile.transit.forEach((transitOption) => {
          const coords = []
          const firstSegmentPattern = transitOption.segmentPatterns[0]
          const patternData = r5Response.patterns.find((pattern) =>
            pattern.pattern_id === firstSegmentPattern.patternId
          )

          // create polyline using stops
          // also add markers for board and alight stops
          for (let i = firstSegmentPattern.fromIndex; i <= firstSegmentPattern.toIndex; i++) {
            const stop = r5Response.stops.find(
              (stop) => stop.stop_id === patternData.stops[i].stop_id
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

  render () {
    const {fromLocation, locationFieldHasFocus, searchingOnMap, toLocation} = this.props
    if (searchingOnMap) return null  // temp fix for https://github.com/airbnb/react-native-maps/issues/453
    return (
      <View
        style={[
          styles.mapContainer,
          locationFieldHasFocus && styles.mapContainerWithLocationFocus
        ]}
        >
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
          {hasCoords(fromLocation) &&
            <MapView.Marker
              coordinate={toLatLng(fromLocation)}
              title={fromLocation.name}
              zIndex={500}
              >
              <ModeifyIcon
                color='#8ec449'
                name='start'
                size={30}
                />
            </MapView.Marker>
          }
          {hasCoords(toLocation) &&
            <MapView.Marker
              coordinate={toLatLng(toLocation)}
              title={toLocation.name}
              zIndex={500}
              >
              <ModeifyIcon
                color='#f5a81c'
                name='end'
                size={30}
                />
            </MapView.Marker>
          }
          {this._renderTripPlanResult()}
        </MapView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapContainer: {
    height: 400
  },
  mapContainerWithLocationFocus: {
    top: 300
  }
})

const polylineStyles = {
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
  SUBWAY: {
    strokeWidth: 8
  },
  WALK: {
    lineDashPattern: [3, 3],
    strokeColor: '#0BC8F4',
    strokeWidth: 3
  }
}

function getPolylineStylesForMode (mode, overrides={}) {
  if (!polylineStyles[mode]) {
    console.warn(`unrecognized access/egress mode: ${mode}`)
    return
  }

  return Object.assign({}, polylineStyles[mode], overrides)
}

function hasCoords(location) {
  return location && (location.lat || location.lat === 0) &&
    (location.lon || location.lon === 0)
}

function toLatLng (location) {
  return {
    latitude: location.lat,
    longitude: location.lon
  }
}
