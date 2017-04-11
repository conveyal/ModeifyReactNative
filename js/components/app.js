// @flow

import React, {Component} from 'react'
import {Image, ScrollView, StyleSheet, Text} from 'react-native'

import LocationForm from '../containers/location-form'
import ResultsList from '../containers/results-list'
import ResultsMap from '../containers/results-map'
import headerStyles from '../util/header-styles'

type Props = {
  appState: string;
  navigation: any;
}

type State = {}

export default class App extends Component {
  props: Props
  state: State

  static navigationOptions = {
    header: ({ state, setParams }) => ({
      style: headerStyles.homeNav,
      title: state.key === 'Init'
        ? <Image
            source={require('../../assets/nav-logo.png')}
            style={headerStyles.homeLogo}
            />
          : <Text style={headerStyles.title}>PLAN YOUR TRIP DETAILS</Text>,
          tintColor: '#fff'
    })
  }

  render () {
    return (
      <ScrollView style={styles.app}>
        <LocationForm
          navigation={this.props.navigation}
          />
        <ResultsMap
          navigation={this.props.navigation}
          />
        <ResultsList
          navigation={this.props.navigation}
          />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: '#fff'
  }
})
