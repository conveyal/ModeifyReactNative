// @flow

import React, { Component } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

const titleTextLookup = {

}

export default class Navbar extends Component {
  render () {
    const {appState} = this.props
    return (
      <View style={styles.nav}>
        {appState !== 'home' &&
          <Image
            source={require('../../assets/back.png')}
            style={styles.back}
            />
        }
        {appState === 'home'
          ? <Image
              source={require('../../assets/nav-logo.png')}
              style={styles.homeLogo}
              />
          : <Text style={styles.title}>titleTextLookup[appState]</Text>
        }
        {appState !== 'home' &&
          <Image
            source={require('../../assets/close.png')}
            style={styles.close}
            />
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  back: {
    position: 'absolute',
    height: 34,
    left: 10,
    resizeMode: 'contain',
    top: 10,
    width: 34
  },
  close: {
    position: 'absolute',
    height: 34,
    right: 10,
    resizeMode: 'contain',
    top: 10,
    width: 34
  },
  homeLogo: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginTop: 5,
    resizeMode: 'contain'
  },
  nav: {
    alignItems: 'stretch',
    backgroundColor: '#455a71',
    flexDirection: 'row',
    justifyContent: 'center',
    height: 50
  },
  title: {
    fontSize: 20
  }
})
