// @flow

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import LocationSelection from '../containers/location-selection'
import Map from '../containers/map'
import Navbar from '../containers/navbar'

export default class App extends Component {
  _renderMap () {
    switch (this.props.appState) {
      case 'home':
        return <Map />
      default:
        return null
    }
  }

  render () {
    const {appState} = this.props
    return (
      <View style={styles.app}>
        <Navbar />
        {/***************************************************
        Location Selection
        ***************************************************/}
        <LocationSelection />
        {/***************************************************
          Map
          ***************************************************/}
        {this._renderMap()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: '#fff',
    flex: 1
  }
})
