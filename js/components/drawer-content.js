// @flow

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
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import {addNavigationHelpers, DrawerItems, DrawerNavigator} from 'react-navigation'

import type { DrawerScene } from 'react-navigation/src/views/Drawer/DrawerView'

type Props = {
  getLabel: (scene: DrawerScene) => ?(React.Element<*> | string),
  navigation: Object,
  renderIcon: (scene: DrawerScene) => ?React.Element<*>,
}

const routesToRenderInMenu = ['Home', 'Settings', 'About', 'Legal']
const activeTintColor = '#2196f3'
const activeBackgroundColor = 'rgba(0, 0, 0, .04)'
const inactiveTintColor = 'rgba(0, 0, 0, .87)'
const inactiveBackgroundColor = 'transparent'

export default class DrawerContent extends Component {
  props: Props

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
          onPress={() => {
            navigation.navigate('DrawerClose');
            navigation.navigate(route.routeName);
          }}
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
    return (
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/cfaz-drawer-logo.png')}
            style={styles.cfazLogo}
            />
        </View>
        {this._renderMenuItems()}
        <TouchableOpacity
          onPress={() => Linking.openURL('http://carfreenearme.com/')}
          >
          <View style={styles.cfnmContainer}>
            <MaterialIcon
              color='#fff'
              name='clippy'
              size={24}
              style={styles.cfnmLogo}
              />
            <Text style={styles.cfnmText}>CAR FREE NEAR ME</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  cfazLogo: {
    flex: 1,
    resizeMode: 'contain',
    width: 300,
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
    marginHorizontal: 16
  },
  cfnmText: {
    color: '#fff',
    margin: 16,
    fontWeight: 'bold'
  },
  container: {
    flex: 1
  },
  logoContainer: {
    height: 100,
    width: 300
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    margin: 16,
    fontWeight: 'bold',
  }
})
