// @flow

import React, {Component} from 'react'
import {View, StyleSheet, Text} from 'react-native'

import Header from './header'

import type {styleOptions} from '../types/rn-style-config'

export default class About extends Component {
  static navigationOptions = {
    drawerLabel: 'ABOUT'
  }

  render () {
    return (
      <View>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='ABOUT'
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

const styles: AboutStyle = StyleSheet.create(({
  content: {
    padding: 10
  }
}: AboutStyle))
