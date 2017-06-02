// @flow

import React, { Component } from 'react'
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  children?: React.Element<*>,
  text?: string,
  url?: string
}

const Linking2: {
  canOpenURL: (url: string) => Promise<boolean>,
  openURL: (string) => void
} = Linking

export default class HyperLink extends Component {
  props: Props

  _onPress = () => {
    const {url} = this.props
    if (!url) return
    Linking2.canOpenURL(url)
      .then((supported: boolean) => {
        if (!supported) {
          console.log('Can\'t handle url: ', url)
        } else {
          return Linking2.openURL(url)
        }
      })
      .catch(err => console.error('An error occurred', err))
  }

  render () {
    const {text} = this.props
    if (text) {
      return (
        <Text
          onPress={this._onPress}
          style={styles.link}
          >
          {this.props.text}
        </Text>
      )
    } else {
      return (
        <TouchableOpacity
          onPress={this._onPress}
          >
          {this.props.children}
        </TouchableOpacity>
      )
    }
  }
}

type LinkStyle = {
  link: styleOptions
}

const linkStyle: LinkStyle = {
  link: {
    color: '#DD9719',
    fontWeight: 'bold'
  }
}

const styles: LinkStyle = StyleSheet.create(linkStyle)
