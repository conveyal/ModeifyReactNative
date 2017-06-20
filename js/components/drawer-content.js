// @flow

import isEqual from 'lodash.isequal'
import lonlat from '@conveyal/lonlat'
import React, {Component} from 'react'
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import {addNavigationHelpers, DrawerItems, DrawerNavigator} from 'react-navigation'

import Button from './button'
import Login from '../containers/login'

import type {
  NavigationAction,
  NavigationScreenProp,
  NavigationState
} from 'react-navigation/src/TypeDefinition'
import type { DrawerScene } from 'react-navigation/src/views/Drawer/DrawerView'

import type {UserReducer} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  getLabel: (scene: DrawerScene) => ?(React.Element<*> | string),
  logout: () => void,
  navigation: NavigationScreenProp<NavigationState, NavigationAction>,
  renderIcon: (scene: DrawerScene) => ?React.Element<*>,
  user: UserReducer
}

type State = {
  showLogin: boolean
}

const routesToRenderInMenu = [
  'Home',
  'Timing',
  'Settings',
  'ServiceAlerts',
  'About',
  'Legal'
]
const activeTintColor = '#2196f3'
const activeBackgroundColor = 'rgba(0, 0, 0, .04)'
const inactiveTintColor = 'rgba(0, 0, 0, .87)'
const inactiveBackgroundColor = 'transparent'

export default class DrawerContent extends Component {
  props: Props
  state: State

  state = {
    showLogin: false
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!isEqual(this.props.user, nextProps.user)) {
      this.setState({
        showLogin: false
      })
    }
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _createNavigationHandlerForRoute = (routeName) => {
    const {navigation} = this.props
    return () => {
      navigation.navigate('DrawerClose')
      navigation.navigate(routeName)
    }
  }

  _onCFNMPress = () => {
    navigator.geolocation.getCurrentPosition(
      (position: Position) => {
        const normalizedPosition = lonlat(position.coords)
        const cfnmLink = 'http://carfreenearme.com/dashboard.cfm?' +
          `cfnmLat=${normalizedPosition.lat}&cfnmLon=${normalizedPosition.lon}` +
          '&cfnmRadius=0.125#map:art:metrobus:metrorail:cabi:car2go'
        Linking.canOpenURL(cfnmLink)
          .then((supported: boolean) => {
            if (!supported) {
              console.log('Can\'t handle url: ', cfnmLink)
            } else {
              return Linking.openURL(cfnmLink)
            }
          })
          .catch(err => console.error('An error occurred', err))
      },
      (error) => {
        Linking.openURL('http://carfreenearme.com/')
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000}
    )
  }

  _onLockDismiss = () => {
    this.setState({
      showLogin: false
    })
  }

  _onLogin = () => {
    this.setState({
      showLogin: true
    })
  }

  _onLogout = () => {
    this.props.logout()
  }

  _onSignup = () => {
    this.setState({
      showLogin: true
    })
  }

  _onViewProfilePress = () => {
    const {navigation} = this.props
    navigation.navigate('DrawerClose')
    navigation.navigate('Profile')
  }

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  _renderMenuItems () {
    const {getLabel, navigation, renderIcon} = this.props
    const itemsToRender = []
    navigation.state.routes.map((route: *, index: number) => {
      if (routesToRenderInMenu.indexOf(route.key) === -1) return
      const focused = navigation.state.index === index
      const color = focused ? activeTintColor : inactiveTintColor
      const backgroundColor = focused
        ? activeBackgroundColor
        : inactiveBackgroundColor
      const scene = { route, index, focused, tintColor: color }
      const icon = renderIcon(scene)
      const label = getLabel(scene)
      itemsToRender.push(
        <TouchableOpacity
          key={route.key}
          onPress={this._createNavigationHandlerForRoute(route.routeName)}
        >
          <View style={[styles.menuItem, { backgroundColor }]}>
            {icon
              ? <View
                  style={[styles.menuIcon, focused ? null : styles.menuIconInactive]}
                >
                  {icon}
                </View>
              : null}
            {typeof label === 'string'
              ? <Text style={[styles.menuLabel, { color }]}>
                  {label}
                </Text>
              : label}
          </View>
        </TouchableOpacity>
      )
    })
    return itemsToRender
  }

  render () {
    const {user} = this.props
    const userLoggedIn: boolean = !!user.idToken

    return (
      <ScrollView style={styles.container}>
        <View>
          {userLoggedIn
            ? <View style={styles.userContainer}>
                <View style={styles.userInfoContainer}>
                  <Image
                    source={{ uri: user.picture }}
                    style={styles.userAvatar}
                    />
                  <Text
                    numberOfLines={1}
                    style={styles.userInfoText}
                    >
                    {user.name}
                  </Text>
                </View>
                <View style={styles.userButtons}>
                  <Button
                    containerStyle={styles.userButton}
                    onPress={this._onViewProfilePress}
                    text='Profile'
                    />
                  <Button
                    containerStyle={styles.userButton}
                    onPress={this._onLogout}
                    text='Logout'
                    />
                </View>
              </View>
            : <View style={styles.userContainer}>
                <Image
                  source={require('../../assets/cfaz-drawer-logo.png')}
                  style={styles.cfazLogo}
                  />
                <View style={styles.userButtons}>
                  <Button
                    containerStyle={styles.userButton}
                    onPress={this._onLogin}
                    text='Login'
                    />
                  <Button
                    containerStyle={styles.userButton}
                    onPress={this._onSignup}
                    text='Sign Up'
                    />
                </View>
              </View>
          }
        </View>
        {this._renderMenuItems()}
        <TouchableOpacity
          onPress={this._onCFNMPress}
          >
          <View style={styles.cfnmContainer}>
            <Image
              source={require('../../assets/CFNM-logo.png')}
              style={styles.cfnmLogo}
              />
            <Text style={styles.cfnmText}>CAR FREE NEAR ME</Text>
          </View>
        </TouchableOpacity>
        {this.state.showLogin &&
          <Login
            onLockDismiss={this._onLockDismiss}
            />
        }
      </ScrollView>
    )
  }
}



type DrawerStyles = {
  cfazLogo: styleOptions,
  cfnmContainer: styleOptions,
  cfnmLogo: styleOptions,
  cfnmText: styleOptions,
  container: styleOptions,
  menuIcon: styleOptions,
  menuIconInactive: styleOptions,
  menuItem: styleOptions,
  menuLabel: styleOptions,
  userAvatar: styleOptions,
  userButton: styleOptions,
  userButtons: styleOptions,
  userContainer: styleOptions,
  userInfoContainer: styleOptions,
  userInfoText: styleOptions
}

const styleConfig: DrawerStyles = {
  cfazLogo: {
    height: 50,
    resizeMode: 'contain',
    width: 250,
    ...Platform.select({
      android: {
        marginLeft: 25
      },
      ios: {
        marginLeft: 5,
        marginTop: 30
      }
    })
  },
  cfnmContainer: {
    backgroundColor: '#97D52A',
    flexDirection: 'row',
    alignItems: 'center'
  },
  cfnmLogo: {
    height: 30,
    marginHorizontal: 16,
    resizeMode: 'contain',
    width: 30
  },
  cfnmText: {
    color: '#fff',
    margin: 16,
    fontWeight: 'bold'
  },
  container: {
    flex: 1
  },
  menuIcon: {
    marginHorizontal: 16,
    width: 24,
    alignItems: 'center',
  },
  menuIconInactive: {
    opacity: 0.62
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  menuLabel: {
    margin: 16,
    fontWeight: 'bold',
  },
  userAvatar: {
    height: 40,
    marginRight: 15,
    resizeMode: 'contain',
    width: 40
  },
  userButton: {
    marginHorizontal: 20,
    width: 80
  },
  userButtons: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: 20
  },
  userContainer: {
    alignItems: 'center',
    ...Platform.select({
      ios: {},
      android: {
        marginTop: 15
      },
    })
  },
  userInfoContainer: {
    flexDirection: 'row',
    marginTop: 40
  },
  userInfoText: {
    flex: 1,
    fontSize: 18,
    marginRight: 10,
    paddingTop: 10
  }
}

const styles: DrawerStyles = StyleSheet.create(styleConfig)
