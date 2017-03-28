// @flow

import React, {Component} from 'react'
import {StyleSheet, View} from 'react-native'

import Navbar from './components/navbar'
import ResultsList from './components/results-list'

export default class App extends Component {

  state = {
    activeSearch: 0,
    searches: [{
      query: {},
      pending: true,
      planResponse: null,
      activeItinerary: 0,
      activeLeg: null,
      activeStep: null
    }]
  }

  componentDidMount () {
    const {searches} = this.state
    searches.push({
      query: {},
      pending: false,
      planResponse: require('../plan.json'),
      activeItinerary: 0,
      activeLeg: null,
      activeStep: null
    })
    setTimeout(() => {
      this.setState({
        activeSearch: 1,
        searches
      })
    }, 1000)
  }

  render () {
    const {activeSearch, searches} = this.state
    return (
      <View style={styles.app}>
        <Navbar appState='results-list' />
        <ResultsList
          activeSearch={activeSearch}
          fromLocation={{
            lat: 38.88709,
            lon: -77.095229,
            name: 'From Location'
          }}
          searches={searches}
          toLocation={{
            lat: 38.894757,
            lon: -77.071506,
            name: 'To Location'
          }}
          />
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
