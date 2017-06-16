// @flow

import React, {Component} from 'react'
import {Dimensions, Image, StyleSheet, View} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './header'
import LocationAndSettings from '../containers/location-and-settings'
import ResultsList from '../containers/results-list'
import ResultsMap from '../containers/results-map'
import tracker from '../util/analytics'
import {headerStyles} from '../util/styles'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {CurrentQuery} from '../types/query'
import type {UserReducerState} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  currentQuery: CurrentQuery,
  loadUserData: (CurrentQuery) => void,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  user: UserReducerState
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

  componentDidMount () {
    tracker.trackScreenView('Home')
  }

  componentWillMount () {
    const {currentQuery, loadUserData, user} = this.props
    if (!user.idToken) {
      loadUserData(currentQuery)
    }
  }

  render () {
    const screenWidth: number = Dimensions.get('window').width
    const horizontalOffset: number = (screenWidth - 200) / 2

    return (
      <View sytle={styles.app}>
        <Header
          left={{menu: true}}
          navigation={this.props.navigation}
          >
          <Image
            source={require('../../assets/nav-logo.png')}
            style={[
              styles.navLogo,
              {
                left: horizontalOffset,
                right: horizontalOffset
              }
            ]}
            />
        </Header>
        <View style={styles.app}>
          <LocationAndSettings
            navigation={this.props.navigation}
            />
          <ResultsMap
            navigation={this.props.navigation}
            />
          <ResultsList
            navigation={this.props.navigation}
            />
        </View>
      </View>
    )
  }
}

type AppStyle = {
  app: styleOptions,
  navLogo: styleOptions
}

const appStyle: AppStyle = {
  app: {
    backgroundColor: '#fff'
  },
  navLogo: {
    height: 37,
    position: 'absolute',
    resizeMode: 'contain',
    top: 10,
    width: 200
  }
}

const styles: AppStyle = StyleSheet.create(appStyle)
