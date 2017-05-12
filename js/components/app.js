// @flow

import React, {Component} from 'react'
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './header'
import LocationForm from '../containers/location-form'
import ResultsList from '../containers/results-list'
import ResultsMap from '../containers/results-map'
import headerStyles from '../util/header-styles'

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

  _onSettingsPress = () => {
    this.props.navigation.navigate('Settings')
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
          <LocationForm
            navigation={this.props.navigation}
            />
          {this.props.currentQuery.to &&
            <View style={styles.settingsButtonContainer}>
              <MaterialIcon.Button
                backgroundColor='#90C450'
                name='settings'
                onPress={this._onSettingsPress}
                >
                Settings
              </MaterialIcon.Button>
            </View>
          }
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
  app: styleOptions,
  settingsButtonContainer: styleOptions
}

const appStyle: AppStyle = {
  app: {
    backgroundColor: '#fff'
  },
  settingsButtonContainer: {
    margin: 10
  }
}

const styles: AppStyle = StyleSheet.create(appStyle)
