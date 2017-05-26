// @flow

import React, {Component} from 'react'
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './header'
import LocationAndSettings from '../containers/location-and-settings'
import ResultsList from '../containers/results-list'
import ResultsMap from '../containers/results-map'
import {headerStyles} from '../util/styles'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  currentQuery: Object,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>
}

type State = {}

export default class App extends Component {
  props: Props
  state: State

  static navigationOptions = {
    drawerLabel: 'HOME',
    drawerIcon: ({ tintColor }) => (
      <MaterialIcon
        name="home"
        size={24}
        style={{ color: tintColor }}
      />
    )
  }

  render () {
    return (
      <View>
        <Header
          left={{menu: true}}
          navigation={this.props.navigation}
          title='Home'
          />
        <ScrollView style={styles.app}>
          <LocationAndSettings
            navigation={this.props.navigation}
            />
          <ResultsMap
            navigation={this.props.navigation}
            />
          <ResultsList
            navigation={this.props.navigation}
            />
        </ScrollView>
      </View>
    )
  }
}

type AppStyle = {
  app: styleOptions
}

const appStyle: AppStyle = {
  app: {
    backgroundColor: '#fff'
  }
}

const styles: AppStyle = StyleSheet.create(appStyle)
