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

import DumbTextButton from './dumb-text-button'
import ModeifyIcon from './modeify-icon'
import {getDayType, getTimeValue} from '../util/date-time'

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

  _onFromPress = () => {
    this.props.navigation.navigate('LocationSelection', { type: 'from' })
  }

  _onHomeInputFocus = () => {
    this.props.navigation.navigate('LocationSelection', { type: 'to' })
  }

  _onModeSettingsPress = () => {
    this.props.navigation.navigate('Settings')
  }

  _onSwitch = () => {
    this.props.switchLocations()
  }

  _onTimingPress = () => {
    this.props.navigation.navigate('Timing')
  }

  _onToPress = () => {
    this.props.navigation.navigate('LocationSelection', { type: 'to' })
  }

  _renderBothLocations (): React.Element<*> {
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
        <View
          style={styles.flexRow}
          >
          {this._renderTiming()}
          {this._renderModes()}
        </View>
      </View>
    )
  }

  _renderCollapsedState (): React.Element<*> {
    let fromText: string = getCollapsedLocationText('From', this.props.currentQuery.from)
    let toText: string = getCollapsedLocationText('To', this.props.currentQuery.to)

    return (
      <View style={styles.collapsed}>
        <TouchableOpacity
          onPress={this._onExpand}
          >
          <View
            style={styles.flexRow}
            >
            <ModeifyIcon
              color='#8ec449'
              name='start'
              size={15}
              />
            <Text>{fromText}</Text>
          </View>
          <View
            style={styles.flexRow}
            >
            <ModeifyIcon
              color='#f5a81c'
              name='end'
              size={15}
              />
            <Text>{toText}</Text>
          </View>
          <DumbTextButton
            backgroundColor='#999999'
            color='#fff'
            containerStyle={styles.editSearchButton}
            text='EDIT SEARCH'
            />
        </TouchableOpacity>
      </View>
    )
  }

  _renderInitialState (): React.Element<*> {
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

  _renderModeIconIfNeeded (
    modeName: string,
    iconName: string
  ): ?React.Element<*> {
    if (this.props.currentQuery.mode[modeName]) {
      return (
        <ModeifyIcon
          name={iconName}
          size={18}
          style={styles.modeIcon}
          />
      )
    }
  }

  _renderModes (): React.Element<*> {
    const {currentQuery} = this.props
    const numModes: number = getNumModes(currentQuery)

    let modeText: string = `${numModes} MODE`
    if (numModes !== 1) {
      modeText += 'S'
    }
    modeText += ' SELECTED'

    return (
      <TouchableOpacity
        onPress={this._onModeSettingsPress}
        style={[styles.settingsContainer, styles.modesContainer]}
        >
        <View style={styles.settingsRow}>
          <Text>{modeText}</Text>
        </View>
        <View style={styles.settingsRow}>
          {this._renderModeIconIfNeeded('rail', 'train')}
          {this._renderModeIconIfNeeded('bus', 'bus')}
          {this._renderModeIconIfNeeded('bike', 'bike')}
          {this._renderModeIconIfNeeded('cabi', 'cabi')}
          {this._renderModeIconIfNeeded('walk', 'walk')}
          {this._renderModeIconIfNeeded('car', 'car')}
        </View>
        <DumbTextButton
          backgroundColor='#F5A729'
          color='#fff'
          containerStyle={styles.settingsDumbButton}
          text='SETTINGS'
          />
      </TouchableOpacity>
    )
  }

  _renderTiming (): React.Element<*> {
    const {currentQuery} = this.props

    const timeRange: string = `${getTimeValue('start', currentQuery)}-${getTimeValue('end', currentQuery)}`
    return (
      <TouchableOpacity
        onPress={this._onTimingPress}
        style={styles.settingsContainer}
        >
        <View
          style={styles.settingsRow}
          >
          <MaterialIcon
            name='calendar'
            size={18}
            style={styles.timingIcon}
            />
          <Text>{getDayType(currentQuery.date)}</Text>
        </View>
        <View
          style={styles.settingsRow}
          >
          <MaterialIcon
            name='clock'
            size={18}
            style={styles.timingIcon}
            />
          <Text>{timeRange}</Text>
        </View>
        <DumbTextButton
          backgroundColor='#F5A729'
          color='#fff'
          containerStyle={styles.settingsDumbButton}
          text='CHANGE'
          />
      </TouchableOpacity>
    )
  }

  render (): React.Element<*> {
    switch (this.props.planViewState) {
      case 'init':
        return this._renderInitialState()
      case 'result-collapsed':
        return this._renderBothLocations()
      default:
        return this._renderCollapsedState()
    }
  }
}

const possibleModes: string[] = [
  'bike',
  'bus',
  'cabi',
  'car',
  'rail',
  'walk'
]

function getNumModes (currentQuery: CurrentQuery): number {
  return possibleModes.reduce(
    (
      accumulator: number,
      currentValue: string
    ) => (
      accumulator + (currentQuery.mode[currentValue] ? 1 : 0)
    ),
    0
  )
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
  currentLocationText: styleOptions,
  editSearchButton: styleOptions,
  flexRow: styleOptions,
  homeInputContainer: styleOptions,
  homeInputText: styleOptions,
  locationContainer: styleOptions,
  locationText: styleOptions,
  modeIcon: styleOptions,
  modesContainer: styleOptions,
  settingsContainer: styleOptions,
  settingsDumbButton: styleOptions,
  settingsRow: styleOptions,
  switchButtonContainer: styleOptions,
  timingIcon: styleOptions,
  topLocationContainer: styleOptions
}

const locationAndSettingsStyle: LocationAndSettingsStyle = {
  collapsed: {
    padding: 5
  },
  collapsedIcon: {
    position: 'absolute',
    right: 5,
    top: 0
  },
  collapsedText: {

  },
  currentLocationText: {
    color: '#15b3ff',
    fontWeight: 'bold'
  },
  editSearchButton: {
    position: 'absolute',
    right: 0,
    top: 4
  },
  flexRow: {
    flexDirection: 'row'
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
  modeIcon: {
    marginHorizontal: 2
  },
  modesContainer: {
    borderColor: '#999999',
    borderLeftWidth: 1
  },
  settingsContainer: {
    alignItems: 'center',
    flex: 1,
    marginVertical: 10,
    padding: 10
  },
  settingsDumbButton: {
    alignItems: 'center',
    marginVertical: 10,
    width: 90
  },
  settingsRow: {
    justifyContent: 'center',
    flexDirection: 'row',
    height: 20
  },
  switchButtonContainer: {
    backgroundColor: '#BCBEC0',
    position: 'absolute',
    right: 30,
    top: 24
  },
  timingIcon: {
    marginRight: 5
  },
  topLocationContainer: {
    borderColor: '#C8C8C8',
    borderBottomWidth: 1
  }
}

const styles: LocationAndSettingsStyle = StyleSheet.create(locationAndSettingsStyle)
