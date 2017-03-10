// @flow

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import LocationSelection from '../containers/location-selection'


export default class App extends Component {

  render () {
    console.log(this.props)
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  app: {
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
