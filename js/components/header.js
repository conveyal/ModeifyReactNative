// @flow

import React, { Component } from 'react';
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import HeaderBackButton from 'react-navigation/src/views/HeaderBackButton'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  left?: {
    back?: boolean,
    menu?: boolean
  },
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  right?: {
    close?: boolean
  },
  title: any
}

export default class Header extends Component {
  props: Props

  _renderLeft (): ?React.Element<View> {
    const {left, navigation} = this.props
    if (left) {
      if (left.back) {
        return (
          <View style={styles.leftBackButton}>
            <HeaderBackButton
              onPress={() => {navigation.goBack(null)}}
              tintColor='#fff'
              />
          </View>
        )
      } else if (left.menu) {
        return (
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate('DrawerOpen')}
              >
              <MaterialIcon
                color='#fff'
                name='menu'
                size={24}
                style={styles.menuButton}
                />
            </TouchableOpacity>
          </View>
        )
      }
    }
  }

  _renderRight () {
    const {right, navigation} = this.props
    if (right && right.close) {
      return (
        <TouchableOpacity
          onPress={() => navigation.goBack(null)}
          style={styles.rightCloseButton}
          >
          <MaterialIcon
            color='#fff'
            name='close'
            size={24}
            />
        </TouchableOpacity>
      )
    }
  }

  _renderTitle () {
    const {title} = this.props
    if (typeof title === 'string') {
      return <Text style={styles.title}>{title}</Text>
    } else {
      return title
    }
  }

  render () {
    return (
      <View style={styles.nav}>
        {this._renderLeft()}
        {this._renderTitle()}
        {this._renderRight()}
      </View>
    )
  }
}

type HeaderStyles = {
  leftBackButton: styleOptions,
  menuButton: styleOptions,
  nav: styleOptions,
  rightCloseButton: styleOptions,
  title: styleOptions
}

const headerStyles: HeaderStyles = {
  leftBackButton: {
    ...Platform.select({
      android: {},
      ios: {
        marginLeft: 10,
        marginTop: 6
      }
    })
  },
  menuButton: {
    margin: 16
  },
  nav: {
    backgroundColor: '#455a71',
    height: 56,
    ...Platform.select({
      android: {},
      ios: {
        marginTop: 20,
        paddingBottom: 15
      }
    })
  },
  rightCloseButton: {
    position: 'absolute',
    right: 16,
    top: 16
  },
  title: {
    bottom: 0,
    color: '#fff',
    fontSize: 17,
    left: 40,
    position: 'absolute',
    right: 40,
    textAlign: 'center',
    top: 16
  }
}

const styles: HeaderStyles = StyleSheet.create(headerStyles)
