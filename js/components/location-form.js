// @flow

import React, {Component} from 'react'
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import ModeifyIcon from './modeify-icon'

export default class LocationForm extends Component {
  _onSwitch = () => {
    this.props.switchLocations()
  }

  _onFromPress = () => {
    this.props.navigation.navigate('LocationSelection', { type: 'from' })
  }

  _onHomeInputFocus = () => {
    this.props.navigation.navigate('LocationSelection', { type: 'to' })
  }

  _onToPress = () => {
    this.props.navigation.navigate('LocationSelection', { type: 'to' })
  }

  _renderBothLocations () {
    const {from, to} = this.props.currentQuery

    return (
      <View style={styles.bothLocationsContainer}>
        <View style={[styles.locationContainer, styles.topLocationContainer]}>
          <ModeifyIcon
            name='start'
            size={30}
            />
          <TouchableOpacity
            onPress={this._onFromPress}
            >
            <Text
              style={[
                styles.locationText,
                from && from.currentLocation
                  ? styles.currentLocationText
                  : {}
              ]}
              >
              {from
                ? from.name
                : 'Where are you coming from?'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.locationContainer}>
          <ModeifyIcon
            name='end'
            size={30}
            />
          <TouchableOpacity
            onPress={this._onToPress}
            >
            <Text
              style={[
                styles.locationText,
                to && to.currentLocation
                  ? styles.currentLocationText
                  : {}
              ]}
              >
              {to
                ? to.name
                : 'Where do you want to go?'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableHighlight
          onPress={this._onSwitch}
          style={styles.switchButtonContainer}
          underlayColor='#dbdee0'
          >
          <ModeifyIcon
            color='#fff'
            name='reverse'
            size={30}
            />
        </TouchableHighlight>
      </View>
    )
  }

  _renderHomeLocation () {
    return (
      <View style={styles.homeInputContainer}>
        <MaterialIcon
          name='magnify'
          size={30}
          />
        <TextInput
          onFocus={this._onHomeInputFocus}
          placeholder='Where do you want to go?'
          style={styles.homeInputText}
          />
      </View>
    )
  }

  render () {
    return !this.props.currentQuery.to
      ? this._renderHomeLocation()
      : this._renderBothLocations()
  }
}

const styles = StyleSheet.create({
  currentLocationText: {
    color: '#15b3ff',
    fontWeight: 'bold'
  },
  homeInputContainer: {
    borderColor: '#C8C8C8',
    borderBottomWidth: 1,
    flexDirection: 'row',
    margin: 10
  },
  homeInputText: {
    flex: 1,
    ...Platform.select({
      android: {
        height: 40
      },
      ios: {
        height: 20,
        paddingLeft: 10,
        paddingTop: 10
      }
    })
  },
  locationContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    padding: 5
  },
  locationText: {
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 7
  },
  switchButtonContainer: {
    backgroundColor: '#BCBEC0',
    position: 'absolute',
    right: 30,
    top: 24
  },
  topLocationContainer: {
    borderColor: '#C8C8C8',
    borderBottomWidth: 1
  }
})
