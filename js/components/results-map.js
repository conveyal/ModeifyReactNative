// @flow

import polyline from 'polyline'
import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import MapView from 'react-native-maps'

const config = require('../../config.json')

type Props = {
  activeSearch: number
}

export default class ResultsMap extends Component {

  constructor(props: Props) {
    super(props)
  }

  _renderTripPlanResult = () => {
    const {activeSearch, searches} = this.props

    if (searches.length === 0 || activeSearch === null) {
      return
    }

    const itemsToRender = []

    searches[activeSearch].planResponse.r5.profile.forEach((profile) => {
      if (profile.summary === 'Non-transit options') {
        // non-transit
        profile.access.forEach((accessMode) => {
          if (!polylineStyles[accessMode.mode]) return
          const combinedLineCoordinates = []
          accessMode.streetEdges.forEach((edge) => {
            polyline.decode(edge.geometry.points).forEach((point) => {
              combinedLineCoordinates.push({
                latitude: point[0],
                longitude: point[1]
              })
            })
          })
          itemsToRender.push(
            <MapView.Polyline
              key={`trip-plan-query-${activeSearch}-${accessMode.mode}`}
              coordinates={combinedLineCoordinates}
              {...polylineStyles[accessMode.mode]}
              />
          )
        })
      }
    })

    return itemsToRender
  }

  render () {
    const {fromLocation, locationFieldHasFocus, toLocation} = this.props
    return (
      <View
        style={[
          styles.mapContainer,
          locationFieldHasFocus && styles.mapContainerWithLocationFocus
        ]}
        >
        <MapView
          style={styles.map}
          initialRegion={config.map.initialRegion}
          >
          {hasCoords(fromLocation) &&
            <MapView.Marker
              coordinate={toLatLng(fromLocation)}
              title={fromLocation.name}
              />
          }
          {hasCoords(toLocation) &&
            <MapView.Marker
              coordinate={toLatLng(toLocation)}
              title={toLocation.name}
              />
          }
          {this._renderTripPlanResult()}
        </MapView>
      </View>
    )
  }
}

const polylineStyles = {
  BICYCLE: {
    strokeColor: '#ef3026'
  },
  CAR: {
    strokeColor: '#888'
  },
  WALK: {
    strokeColor: '#0BC8F4'
  }
}

const styles = StyleSheet.create({
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
