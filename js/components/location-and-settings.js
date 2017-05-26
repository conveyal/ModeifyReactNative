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

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {CurrentQuery, Location} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  changePlanViewState: (string) => void,
  currentQuery: CurrentQuery,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  planViewState: string,
  switchLocations: () => void
}

export default class LocationAndSettings extends Component {
  props: Props

  _onExpand = () => {
    this.props.changePlanViewState('result-collapsed')
  }

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
    const from: Location = this.props.currentQuery.from
    const to: Location = this.props.currentQuery.to

    return (
      <View>
        <View style={[styles.locationContainer, styles.topLocationContainer]}>
          <ModeifyIcon
            color='#8ec449'
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
            color='#f5a81c'
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

  _renderCollapsedState () {
    let fromText: string = getCollapsedLocationText('From', this.props.currentQuery.from)
    let toText: string = getCollapsedLocationText('To', this.props.currentQuery.to)

    return (
      <View style={styles.collapsed}>
        <TouchableOpacity
          onPress={this._onExpand}
          style={styles.collapsedContent}
          >
          <View
            style={styles.collapsedLocation}
            >
            <ModeifyIcon
              color='#8ec449'
              name='start'
              size={15}
              />
            <Text
              style={styles.collapsedText}
              >
              {fromText}
            </Text>
          </View>
          <View
            style={styles.collapsedLocation}
            >
            <ModeifyIcon
              color='#f5a81c'
              name='end'
              size={15}
              />
            <Text
              style={styles.collapsedText}
              >
              {toText}
            </Text>
          </View>
          <View
            style={styles.editSearchContainer}
            >
            <Text
              style={styles.editSearchText}
              >
              EDIT SEARCH
            </Text>
          </View>
        </TouchableOpacity>
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

  render (): React.Element<*> {
    switch (this.props.planViewState) {
      case 'init':
        return this._renderHomeLocation()
      case 'result-collapsed':
        return this._renderBothLocations()
      default:
        return this._renderCollapsedState()
    }
  }
}

function getCollapsedLocationText (prefix: string, location: ?Location): string {
  let outputText: string = location
    ? `${prefix} ${location.name}`
    : '${prefix} location not set'

  if (outputText.length > 35) {
    outputText = outputText.substring(0, 35) + '...'
  }

  return outputText
}

type LocationAndSettingsStyle = {
  collapsed: styleOptions,
  collapsedContent: styleOptions,
  collapsedIcon: styleOptions,
  collapsedLocation: styleOptions,
  collapsedText: styleOptions,
  currentLocationText: styleOptions,
  editSearchContainer: styleOptions,
  editSearchText: styleOptions,
  homeInputContainer: styleOptions,
  homeInputText: styleOptions,
  locationContainer: styleOptions,
  locationText: styleOptions,
  switchButtonContainer: styleOptions,
  topLocationContainer: styleOptions
}

const locationAndSettingsStyle: LocationAndSettingsStyle = {
  collapsed: {
    padding: 5
  },
  collapsedContent: {
    flex: 1
  },
  collapsedIcon: {
    position: 'absolute',
    right: 5,
    top: 0
  },
  collapsedLocation: {
    flexDirection: 'row'
  },
  collapsedText: {

  },
  currentLocationText: {
    color: '#15b3ff',
    fontWeight: 'bold'
  },
  editSearchContainer: {
    backgroundColor: '#999999',
    borderColor: '#999999',
    borderRadius: 5,
    borderWidth: 1,
    padding: 4,
    position: 'absolute',
    right: 0,
    top: 4
  },
  editSearchText: {
    color: '#fff',
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
}

const styles: LocationAndSettingsStyle = StyleSheet.create(locationAndSettingsStyle)
