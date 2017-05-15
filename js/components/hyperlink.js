// @flow
import React, { Component } from 'react'
import {
  Linking,
  StyleSheet,
  Text
} from 'react-native'

import type {styleOptions} from '../types/rn-style-config'

type Props = {
  text: string,
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
          return Linking.openURL(url)
        }
      })
      .catch(err => console.error('An error occurred', err))
  }

  render () {
    return (
      <Text
        onPress={this._onPress}
        style={styles.link}
        >
        {this.props.text}
      </Text>
    )
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
