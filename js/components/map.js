// @flow

import polyline from 'polyline'
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView from 'react-native-maps'

const config = require('../../config.json')

type Props = {
  activeSearch: number
}

export default class Map extends Component {

  constructor(props: Props) {
    super(props)
  }

  _renderTripPlanResult = () => {
    const {activeSearch, searches} = this.props

    if (searches.length === 0 || activeSearch === null) {
      return
    }

    const itemsToRender = []

    searches[activeSearch].planResponse.profile.forEach((profile) => {
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
              key={`trip-plan-querty-${activeSearch}-${accessMode.mode}`}
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
          {fromLocation &&
            <MapView.Marker
              coordinate={toLatLng(fromLocation)}
              title={fromLocation.name}
              />
          }
          {toLocation &&
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
    ...StyleSheet.absoluteFillObject,
    top: 120,
  },
  mapContainerWithLocationFocus: {
    top: 300
  }
})

function toLatLng (location) {
  return {
    latitude: location.lat,
    longitude: location.lon
  }
}
