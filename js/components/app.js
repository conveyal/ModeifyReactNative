// @flow

import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import LocationSelection from '../containers/location-selection'
import ResultsList from '../containers/results-list'
import ResultsMap from '../containers/results-map'
import Settings from '../containers/settings'
import Navbar from '../containers/navbar'

export default class App extends Component {
  _renderLocationSelection () {
    switch (this.props.appState) {
      case 'home':
      case 'location-selection':
        return <LocationSelection />
      default:
        return null
    }
  }

  _renderResultsList () {
    switch (this.props.appState) {
      case 'results-list':
        return <ResultsList />
      default:
        return null
    }
  }

  _renderResultsMap () {
    switch (this.props.appState) {
      case 'home':
        return <ResultsMap />
      default:
        return null
    }
  }

  _renderSettings () {
    if (this.props.appState === 'settings') {
      return <Settings />
    }
  }

  render () {
    const {appState} = this.props
    return (
      <View style={styles.app}>
        <Navbar />
        {this._renderLocationSelection()}
        {this._renderResultsMap()}
        {this._renderResultsList()}
        {this._renderSettings()}
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
