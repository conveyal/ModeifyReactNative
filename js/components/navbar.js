// @flow

import React, { Component } from 'react'
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const titleTextLookup = {
  'location-selection': 'PLAN YOUR TRIP DETAILS'
}

export default class Navbar extends Component {
  _onBack = () => {
    this.props.back(this.props.appState)
  }

  _onClose = () => {
    this.props.close()
  }

  render () {
    const {appState} = this.props
    return (
      <View>
        {Platform.OS === 'ios' &&
          <View style={styles.statusBarSpacer} />
        }
        <View style={styles.nav}>
          {appState !== 'home' &&
            <TouchableOpacity
              onPress={this._onBack}
              style={styles.backContainer}
              >
              <Image
                source={require('../../assets/back.png')}
                style={styles.backImage}
                />
            </TouchableOpacity>
          }
          {appState === 'home'
            ? <Image
                source={require('../../assets/nav-logo.png')}
                style={styles.homeLogo}
                />
            : <Text style={styles.title}>{titleTextLookup[appState]}</Text>
          }
          {appState !== 'home' &&
          <TouchableOpacity
            onPress={this._onClose}
            style={styles.closeContainer}
            >
            <Image
              source={require('../../assets/close.png')}
              style={styles.closeImage}
              />
          </TouchableOpacity>
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  backContainer: {
    position: 'absolute',
    height: 34,
    left: 10,
    top: 10,
    width: 34
  },
  backImage: {
    height: 34,
    resizeMode: 'contain',
    width: 34
  },
  closeContainer: {
    position: 'absolute',
    height: 34,
    right: 10,
    top: 10,
    width: 34
  },
  closeImage: {
    height: 34,
    resizeMode: 'contain',
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
  statusBarSpacer: {
    backgroundColor: '#5a7491',
    height: 20
  },
  title: {
    color: '#fff',
    fontSize: 17,
    marginTop: 15
  }
})
