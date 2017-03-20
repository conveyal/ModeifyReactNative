// @flow

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import LocationSelection from '../containers/location-selection'
import Map from '../containers/map'
import Navbar from '../containers/navbar'

export default class App extends Component {
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
        <Map />
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
