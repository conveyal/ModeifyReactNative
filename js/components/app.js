// @flow

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import LocationSelection from '../containers/location-selection'
import Map from '../containers/map'

export default class App extends Component {
  render () {
    return (
      <View style={styles.app}>
        <View style={styles.nav}>
          <Text style={styles.title}>CarFreeAtoZ</Text>
        </View>
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
  },
  nav: {
    borderBottomWidth: 1
  },
  title: {
    fontSize: 20,
    textAlign: 'center'
  }
})
