// @flow

import React, {Component} from 'react'
import {View, StyleSheet, Text} from 'react-native'

import Header from './header'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>
}

export default class Legal extends Component {
  props: Props

  static navigationOptions = {
    drawerLabel: 'LEGAL'
  }

  render () {
    return (
      <View>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='LEGAL'
          />
        <View style={styles.content}>
          <Text>This is an app that does stuff.</Text>
        </View>
      </View>
    )
  }
}

type AboutStyle = {
  content: styleOptions
}

const aboutStyle: AboutStyle = {
  content: {
    padding: 10
  }
}

const styles: AboutStyle = StyleSheet.create(aboutStyle)
