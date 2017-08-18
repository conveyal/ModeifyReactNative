// @flow

import isNumber from 'lodash.isnumber'
import React, {Component} from 'react'
import {
  Image,
  Linking,
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

import type {CurrentQuery, Location, UserReducerState} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  addFavorite: ({
    locationAddress: string,
    user: UserReducerState
  }) => void,
  changePlanViewState: (string) => void,
  currentQuery: CurrentQuery,
  deleteFavorite: ({
    favoriteIdx: number,
    user: UserReducerState
  }) => void,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  planViewState: string,
  switchLocations: () => void,
  user: UserReducerState
}

type State = {
  locationIsCurrentLocation: boolean,
  locationIsFavorite: boolean,
  locationMenuTop: number,
  locationMenuType: string,
  showingLocationMenu: boolean
}

const Linking2: {
  canOpenURL: (url: string) => Promise<boolean>,
  openURL: (string) => void
} = Linking

export default class LocationAndSettings extends Component {
  props: Props
  state: State

  state = {
    locationIsCurrentLocation: false,
    locationIsFavorite: false,
    locationMenuTop: 20,
    locationMenuType: '',
    showingLocationMenu: false
  }

  componentWillReceiveProps (nextProps: Props) {
    // refresh menu state if menu is open
    const {locationMenuType, showingLocationMenu} = this.state
    if (showingLocationMenu) {
      if (locationMenuType === 'from') {
        this._setMenuState('from', nextProps)
      } else {
        this._setMenuState('to', nextProps)
      }
    }
  }

  _getLocationData (type: 'from' | 'to', props: Props): {
    isCurrent: boolean,
    isFavorite: boolean
  } {

    const {currentQuery, user} = props

    const location: Location = currentQuery[type]

    return {
      isCurrent: location.currentLocation,
      isFavorite: (
        user.idToken &&
        user.userMetadata &&
        user.userMetadata.modeify_places &&
        getfavoriteIdx(location, user) > -1
      )
    }
  }

  _setMenuState (type: 'from' | 'to', props: Props) {
    const locationData = this._getLocationData(type, props)
    this.setState({
      locationIsCurrentLocation: locationData.isCurrent,
      locationIsFavorite: locationData.isFavorite,
      locationMenuTop: type === 'from' ? 20 : 40,
      locationMenuType: type,
      showingLocationMenu: true
    })
  }

  // --------------------------------------------------
  // handlers
  // --------------------------------------------------

  _onCloseLocationMenu = () => {
    this.setState({
      locationIsCurrentLocation: false,
      locationIsFavorite: false,
      locationMenuTop: 20,
      locationMenuType: '',
      showingLocationMenu: false
    })
  }

  _onExpand = () => {
    this.props.changePlanViewState('result-collapsed')
  }

  _onFromMenuPress = () => {
    this._setMenuState('from', this.props)
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

  _onToggleFavorite = () => {
    const {addFavorite, currentQuery, deleteFavorite, user} = this.props
    const {
      locationIsCurrentLocation,
      locationIsFavorite,
      locationMenuType
    } = this.state

    const location: Location = currentQuery[locationMenuType]

    if (locationIsCurrentLocation) {
      return alert('Only addresses can be favorited')
    }

    if (!user.idToken) {
      // show login?
      return alert('You must be logged in to perform this action')
    }

    if (locationIsFavorite) {
      deleteFavorite({
        favoriteIdx: getfavoriteIdx(location, user),
        user
      })
    } else {
      addFavorite(({
        location: {
          address: location.name,
          lat: location.lat,
          lon: location.lon
        },
        user
      }: any))
    }
  }

  _onToMenuPress = () => {
    this._setMenuState('to', this.props)
  }

  _onToPress = () => {
    this.props.navigation.navigate('LocationSelection', { type: 'to' })
  }

  _onViewInCFNMPress = () => {
    const location: Location = this.props.currentQuery[this.state.locationMenuType]

    if (isNumber(location.lat) && isNumber(location.lon)) {
      const cfnmLink = 'http://carfreenearme.com/dashboard.cfm?' +
        `cfnmLat=${location.lat}&cfnmLon=${location.lon}` +
        '&cfnmRadius=0.125#map:art:metrobus:metrorail:cabi:car2go'
      Linking2.canOpenURL(cfnmLink)
        .then((supported: boolean) => {
          if (!supported) {
            console.log('Can\'t handle url: ', cfnmLink)
          } else {
            return Linking2.openURL(cfnmLink)
          }
        })
        .catch(err => console.error('An error occurred', err))
    }
  }

  // --------------------------------------------------
  // handlers
  // --------------------------------------------------

  _renderBothLocations (): React.Element<*> {
    const from: Location = this.props.currentQuery.from
    const to: Location = this.props.currentQuery.to

    const {
      locationIsFavorite,
      locationMenuTop,
      locationMenuType,
      showingLocationMenu
    } = this.state

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
            style={styles.locationTextContainer}
            >
            <Text
              numberOfLines={1}
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
          <TouchableOpacity
            onPress={this._onFromMenuPress}
            style={styles.favoriteDots}
            >
            <MaterialIcon
              color='#BCBEC0'
              name='dots-vertical'
              size={30}
              />
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
            style={styles.locationTextContainer}
            >
            <Text
              numberOfLines={1}
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
          <TouchableOpacity
            onPress={this._onToMenuPress}
            style={styles.favoriteDots}
            >
            <MaterialIcon
              color='#BCBEC0'
              name='dots-vertical'
              size={30}
              />
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
        {showingLocationMenu &&
          <View style={[
              styles.menuOverlay,
              {
                right: 10,
                top: locationMenuTop
              }
            ]}>
            <View style={styles.menuHeader}>
              <Text
                style={styles.menuHeaderText}
                >
                Preferences
              </Text>
              <TouchableOpacity
                onPress={this._onCloseLocationMenu}
                style={styles.menuCloseButton}
                >
                <MaterialIcon
                  name='close'
                  size={20}
                  />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={this._onToggleFavorite}
              style={[
                styles.menuRow,
                styles.menuRowBottom
              ]}
              >
              <MaterialIcon
                name={`heart${locationIsFavorite ? '' : '-outline'}`}
                size={20}
                />
              <Text
                style={styles.menuRowText}
                >
                {locationIsFavorite
                  ? 'Remove from Favorites'
                  : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this._onViewInCFNMPress}
              style={styles.menuRow}
              >
              <Image
                source={require('../../assets/CFNM-logo.png')}
                style={styles.cfnmLogo}
                />
              <Text
                style={styles.menuRowText}
                >
                View in CarFreeNearMe
              </Text>
            </TouchableOpacity>
          </View>
        }
      </View>
    )
  }

  _renderCollapsedState (): React.Element<*> {
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
            <Text
              numberOfLines={1}
              style={styles.collapsedText}
              >
              {getCollapsedLocationText('From', this.props.currentQuery.from)}
            </Text>
          </View>
          <View
            style={styles.flexRow}
            >
            <ModeifyIcon
              color='#f5a81c'
              name='end'
              size={15}
              />
            <Text
              numberOfLines={1}
              style={styles.collapsedText}
              >
              {getCollapsedLocationText('To', this.props.currentQuery.to)}
            </Text>
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

function getfavoriteIdx (location: Location, user: UserReducerState): number {
  return user.userMetadata.modeify_places.findIndex((place: { address: string }) =>
    location.name === place.address
  )
}

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
  return (
    location
      ? `${prefix} ${location.name}`
      : `${prefix} location not set`
  )
}

type LocationAndSettingsStyle = {
  cfnmLogo: styleOptions,
  collapsed: styleOptions,
  collapsedText: styleOptions,
  currentLocationText: styleOptions,
  editSearchButton: styleOptions,
  favoriteDots: styleOptions,
  flexRow: styleOptions,
  homeInputContainer: styleOptions,
  homeInputText: styleOptions,
  locationContainer: styleOptions,
  locationText: styleOptions,
  locationTextContainer: styleOptions,
  menuCloseButton: styleOptions,
  menuHeader: styleOptions,
  menuHeaderText: styleOptions,
  menuOverlay: styleOptions,
  menuRow: styleOptions,
  menuRowBottom: styleOptions,
  menuRowText: styleOptions,
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
  cfnmLogo: {
    height: 20,
    resizeMode: 'contain',
    width: 20
  },
  collapsed: {
    padding: 5
  },
  collapsedText: {
    marginRight: 120
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
  favoriteDots: {
    position: 'absolute',
    right: 0,
    top: 5
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
  locationTextContainer: {
    marginRight: 48
  },
  menuCloseButton: {
    position: 'absolute',
    right: 5,
    top: 10
  },
  menuHeader: {
    justifyContent: 'center',
    borderBottomColor: '#BCBEC0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10
  },
  menuHeaderText: {
    fontWeight: 'bold'
  },
  menuOverlay: {
    borderRadius: 2,
    backgroundColor: 'white',
    position: 'absolute',
    width: 200,

    // Shadow only works on iOS.
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 4,

    // This will elevate the view on Android, causing shadow to be drawn.
    elevation: 8
  },
  menuRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: 10
  },
  menuRowBottom: {
    borderBottomColor: '#BCBEC0',
    borderBottomWidth: 1,
    paddingBottom: 5
  },
  menuRowText: {
    marginLeft: 10
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
    right: 45,
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
