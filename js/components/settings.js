// @flow

import moment from 'moment'
import React, { Component } from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import ModalDropdown from 'react-native-modal-dropdown'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './header'
import ModeifyIcon from './modeify-icon'
import headerStyles from '../util/header-styles'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {
  CurrentQuery,
  ModeifyModeSettings,
  ModeifyTiming
} from '../types'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  changePlanPostpressSetting({
    setting: string,
    value: string
  }): void,
  currentQuery: CurrentQuery,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  planPostprocessSettings: {
    parkingCost: number,
    drivingCostPerMile: number
  },
  setDate({ date: string }): void,
  setMode({ mode: ModeifyModeSettings }): void,
  setTime({ time: ModeifyTiming }): void
}

type State = {
  activeTab: string;
}

const bikeSpeedOptions: string[] = ['4 mph', '6 mph', '8 mph', '10 mph']
const bikeSpeedValues: number[] = [4, 6, 8, 10]
const bikeTrafficStressOptions: string[] = ['Level 1', 'Level 2', 'Level 3', 'Level 4']
const bikeTrafficStressValues: number[] = [1, 2, 3, 4]
const walkSpeedOptions: string[] = ['2 mph', '3 mph', '4 mph']
const walkSpeedValues: number[] = [2, 3, 4]

const dayOfWeekOptions: string[] = ['Mon-Fri', 'Saturday', 'Sunday']
const endHourOptions: string[] = []
const endHourValues: string[] = []
const startHourOptions: string[] = ['Midnight']
const startHourValues: string[] = ['0:00']

for (let i: number = 1; i < 12; i++) {
  const curHourOption: string = `${i}am`
  const curHourValue: string = `${i}:00`
  endHourOptions.push(curHourOption)
  endHourValues.push(curHourValue)
  startHourOptions.push(curHourOption)
  startHourValues.push(curHourValue)
}

endHourOptions.push('Noon')
endHourValues.push('12:00')
startHourOptions.push('Noon')
startHourValues.push('12:00')

for (let i: number = 1; i < 12; i++) {
  const curHourOption: string = `${i}pm`
  const curHourValue: string = `${i + 12}:00`
  endHourOptions.push(curHourOption)
  endHourValues.push(curHourValue)
  startHourOptions.push(curHourOption)
  startHourValues.push(curHourValue)
}

endHourOptions.push('Midnight')
endHourValues.push('23:59')


export default class Settings extends Component {
  props: Props
  state: State

  state = {
    activeTab: 'modes'
  }

  static navigationOptions = {
    drawerLabel: 'SETTINGS',
    drawerIcon: ({ tintColor }) => (
      <MaterialIcon
        name='settings'
        size={24}
        style={{ color: tintColor }}
        />
    )
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _onBikePress = () => {
    this._toggleMode('bike')
  }

  _onBikeSpeedChange = (idx: number) => {
    this._setModeSetting('bikeSpeed', bikeSpeedValues[idx])
  }

  _onBikeMaxTimeChange = (text: string) => {
    if (!isValidNumericText(text)) {
      return
    }
    this._setModeSetting('maxBikeTime', text)
  }

  _onBikeTrafficStressChange = (idx: number) => {
    this._setModeSetting('bikeTrafficStress', bikeTrafficStressValues[idx])
  }

  _onBusPress = () => {
    this._toggleMode('bus')
  }

  _onCabiPress = () => {
    this._toggleMode('cabi')
  }

  _onCarPress = () => {
    this._toggleMode('car')
  }

  _onDayOfWeekChange = (idx: number) => {
    const planDate = moment()
    function isRightDayOfWeek (): boolean {
      const dayOfWeek = planDate.day()
      switch (idx) {
        case '0':
          return dayOfWeek > 0 && dayOfWeek < 6
        case '1':
          return dayOfWeek === 6
        case '2':
          return dayOfWeek === 0
        default:
          // should not happen, but return true to prevent infinite loop
          return true
      }
    }

    while (!isRightDayOfWeek()) {
      planDate.add(1, 'days')
    }

    this.props.setDate({ date: planDate.format('YYYY-MM-DD') })
  }

  _onDrivingCostPerMileChange = (text: string) => {
    if (!isValidDecimal(text)) {
      return
    }
    this._setPostprocessSetting('drivingCostPerMile', text)
  }

  _onEndHourChange = (endIdx: number) => {
    const {currentQuery, setTime} = this.props
    const {time} = currentQuery

    time.end = endHourValues[endIdx]

    if(startHourValues.indexOf(time.start) > endIdx) {
      // set start to 1 hour before end
      time.start = startHourValues[endIdx]
      this.refs.startTime.select(endIdx)
    }

    setTime({ time })
  }

  _onParkingCostChange = (text: string) => {
    if (!isValidDecimal(text)) {
      return
    }
    this._setPostprocessSetting('parkingCost', text)
  }

  _onRailPress = () => {
    this._toggleMode('rail')
  }

  _onStartHourChange = (startIdx: number) => {
    const {currentQuery, setTime} = this.props
    const {time} = currentQuery

    time.start = startHourValues[startIdx]

    if(endHourValues.indexOf(time.end) < startIdx) {
      // set end to 1 hour after start
      time.end = endHourValues[startIdx]
      this.refs.endTime.select(startIdx)
    }

    setTime({ time })
  }

  _onWalkMaxTimeChange = (text: string) => {
    if (!isValidNumericText(text)) {
      return
    }
    this._setModeSetting('maxWalkTime', text)
  }

  _onWalkPress = () => {
    this._toggleMode('walk')
  }

  _onWalkSpeedChange = (idx: number) => {
    this._setModeSetting('walkSpeed', walkSpeedValues[idx])
  }

  _setModeSetting (key: string, value: number | string) {
    const {currentQuery, setMode} = this.props
    const newModeSettings = Object.assign({}, currentQuery.mode.settings)
    newModeSettings[key] = value
    const newMode = Object.assign({}, currentQuery.mode, { settings: newModeSettings })
    setMode({ mode: newMode })
  }

  _setPostprocessSetting (key: string, value: string) {
    const {changePlanPostpressSetting} = this.props
    changePlanPostpressSetting({
      setting: key,
      value
    })
  }

  _toggleMode (mode: string) {
    const {currentQuery, setMode} = this.props
    const newMode: ModeifyModeSettings = Object.assign({}, currentQuery.mode)
    newMode[mode] = !newMode[mode]
    setMode({ mode: newMode })
  }

  _toggleTab = () => {
    this.setState({
      activeTab: this.state.activeTab === 'modes' ? 'general' : 'modes'
    })
  }

  // ------------------------------------------------------------------------
  // helpers
  // ------------------------------------------------------------------------

  _getDefaultDateValue () {
    const planDayOfWeek = moment(this.props.currentQuery.date).day()
    switch (planDayOfWeek) {
      case 0:
        return 'Sunday'
      case 6:
        return 'Saturday'
      default:
        return 'Mon-Fri'
    }
  }

  _getDefaultTimeValue (type: 'start' | 'end') {
    const {time} = this.props.currentQuery
    if (type === 'start') {
      return startHourOptions[
        startHourValues.indexOf(
          time.start
        )
      ]
    } else {
      return endHourOptions[
        endHourValues.indexOf(
          time.end
        )
      ]
    }
  }

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  _renderGeneralContent () {
    return (
      <View style={styles.content}>
        <Text style={styles.timingHeader}>Day of Week</Text>
        <ModalDropdown
          defaultValue={this._getDefaultDateValue()}
          dropdownTextStyle={styles.dropdownText}
          onSelect={this._onDayOfWeekChange}
          options={dayOfWeekOptions}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          />
        <Text style={styles.timingHeader}>From</Text>
        <ModalDropdown
          defaultValue={this._getDefaultTimeValue('start')}
          dropdownTextStyle={styles.dropdownText}
          onSelect={this._onStartHourChange}
          options={startHourOptions}
          ref='startTime'
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          />
        <Text style={styles.timingHeader}>To</Text>
        <ModalDropdown
          defaultValue={this._getDefaultTimeValue('end')}
          dropdownTextStyle={styles.dropdownText}
          onSelect={this._onEndHourChange}
          options={endHourOptions}
          ref='endTime'
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          />
      </View>
    )
  }

  _renderModesContent () {
    const {mode} = this.props.currentQuery
    const {
      bikeSpeed,
      bikeTrafficStress,
      maxBikeTime,
      maxWalkTime,
      walkSpeed
    } = mode.settings
    const {planPostprocessSettings} = this.props

    return (
      <View style={styles.content}>
        <View style={styles.modeGrouping}>
          <Text style={styles.modeGroupingTitleText}>TRANSIT</Text>
          <TouchableOpacity
            onPress={this._onRailPress}
            >
            <ModeifyIcon
              name='train'
              size={40}
              style={styles.modeIcon}
              />
            {mode.rail &&
              <MaterialIcon
                name='checkbox-marked-circle'
                size={25}
                style={styles.modeIconCheck}
                />
            }
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._onBusPress}
            >
            <ModeifyIcon
              name='bus'
              size={40}
              style={styles.modeIcon}
              />
            {mode.bus &&
              <MaterialIcon
                name='checkbox-marked-circle'
                size={25}
                style={styles.modeIconCheck}
                />
            }
          </TouchableOpacity>
        </View>
        <View style={styles.modeGrouping}>
          <Text style={styles.modeGroupingTitleText}>BIKE</Text>
          <TouchableOpacity
            onPress={this._onBikePress}
            >
            <ModeifyIcon
              name='bike'
              size={40}
              style={styles.modeIcon}
              />
            {mode.bike &&
              <MaterialIcon
                name='checkbox-marked-circle'
                size={25}
                style={styles.modeIconCheck}
                />
            }
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._onCabiPress}
            >
            <ModeifyIcon
              name='cabi'
              size={40}
              style={styles.modeIcon}
              />
            {mode.cabi &&
              <MaterialIcon
                name='checkbox-marked-circle'
                size={25}
                style={styles.modeIconCheck}
                />
            }
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._onWalkPress}
            >
            <ModeifyIcon
              name='walk'
              size={40}
              style={styles.modeIcon}
              />
            {mode.walk &&
              <MaterialIcon
                name='checkbox-marked-circle'
                size={25}
                style={styles.modeIconCheck}
                />
            }
          </TouchableOpacity>
        </View>
        <View style={styles.modeGrouping}>
          <Text style={styles.modeGroupingTitleText}>CAR</Text>
          <TouchableOpacity
            onPress={this._onCarPress}
            >
            <ModeifyIcon
              name='car'
              size={40}
              style={styles.modeIcon}
              />
            {mode.car &&
              <MaterialIcon
                name='checkbox-marked-circle'
                size={25}
                style={styles.modeIconCheck}
                />
            }
          </TouchableOpacity>
        </View>
        <View style={styles.modeSettingsSection}>
          <ModeifyIcon
            name='bike'
            size={40}
            style={styles.modeSettingsIcon}
            />
          <Text
            style={styles.modeSettingsText}
            >
            speed:
          </Text>
          <ModalDropdown
            defaultValue={`${bikeSpeed} mph`}
            dropdownTextStyle={styles.dropdownText}
            onSelect={this._onBikeSpeedChange}
            options={bikeSpeedOptions}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            />
          <Text
            style={styles.modeSettingsText}
            >
            max time:
          </Text>
          <TextInput
            keyboardType='numeric'
            onChangeText={this._onBikeMaxTimeChange}
            style={styles.numericInput}
            value={'' + maxBikeTime}
            />
          <Text
            style={styles.modeSettingsText}
            >
            traffic stress tolerance:
          </Text>
          <ModalDropdown
            defaultValue={`Level ${bikeTrafficStress}`}
            dropdownTextStyle={styles.dropdownText}
            onSelect={this._onBikeTrafficStressChange}
            options={bikeTrafficStressOptions}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            />
        </View>
        <View style={styles.modeSettingsSection}>
          <ModeifyIcon
            name='walk'
            size={40}
            style={styles.modeSettingsIcon}
            />
          <Text
            style={styles.modeSettingsText}
            >
            speed:
          </Text>
          <ModalDropdown
            defaultValue={`${walkSpeed} mph`}
            dropdownTextStyle={styles.dropdownText}
            onSelect={this._onWalkSpeedChange}
            options={walkSpeedOptions}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            />
          <Text
            style={styles.modeSettingsText}
            >
            max time:
          </Text>
          <TextInput
            keyboardType='numeric'
            onChangeText={this._onWalkMaxTimeChange}
            style={styles.numericInput}
            value={'' + maxWalkTime}
            />
        </View>
        <View style={styles.modeSettingsSection}>
          <ModeifyIcon
            name='car'
            size={40}
            style={styles.modeSettingsIcon}
            />
          <Text
            style={styles.modeSettingsText}
            >
            parking $:
          </Text>
          <TextInput
            keyboardType='numeric'
            onChangeText={this._onParkingCostChange}
            style={styles.numericInput}
            value={'' + planPostprocessSettings.parkingCost}
            />
          <Text
            style={styles.modeSettingsText}
            >
            per mile $:
          </Text>
          <TextInput
            keyboardType='numeric'
            onChangeText={this._onDrivingCostPerMileChange}
            style={styles.numericInput}
            value={'' + planPostprocessSettings.drivingCostPerMile}
            />
        </View>
      </View>
    )
  }

  render () {
    const {activeTab} = this.state

    return (
      <View>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='Home'
          />
        <ScrollView>
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={this._toggleTab}
              style={[
                styles.tabTitle,
                activeTab === 'modes' ? styles.tabBarActive : {}
              ]}
              >
              <Text style={styles.tabTitleText}>
                MODES
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this._toggleTab}
              style={[
                styles.tabTitle,
                styles.tabBorderLeft,
                activeTab === 'general' ? styles.tabBarActive : {}
              ]}
              >
              <Text style={styles.tabTitleText}>
                GENERAL
              </Text>
            </TouchableOpacity>
          </View>
          {activeTab === 'modes'
            ? this._renderModesContent()
            : this._renderGeneralContent()}
        </ScrollView>
      </View>
    )
  }
}

type SettingsStyle = {
  content: styleOptions,
  dropdown: styleOptions,
  dropdownText: styleOptions,
  modeGrouping: styleOptions,
  modeGroupingTitleText: styleOptions,
  modeIcon: styleOptions,
  modeIconSecond: styleOptions,
  modeIconCheck: styleOptions,
  modeSettingsIcon: styleOptions,
  modeSettingsSection: styleOptions,
  modeSettingsText: styleOptions,
  numericInput: styleOptions,
  tabBar: styleOptions,
  tabBarActive: styleOptions,
  tabBorderLeft: styleOptions,
  tabTitle: styleOptions,
  tabTitleText: styleOptions,
  timingHeader: styleOptions
}

const settingsStyle: SettingsStyle = {
  content: {
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  dropdown: {
    backgroundColor: '#c9c9c9',
    height: 40,
    padding: 10
  },
  dropdownText: {
    fontSize: 16
  },
  modeGrouping: {
    backgroundColor: '#90C450',
    borderColor: '#90C450',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 15,
    marginVertical: 10
  },
  modeGroupingTitleText: {
    color: '#374D1A',
    fontSize: 15,
    fontWeight: 'bold',
    paddingLeft: 10,
    paddingTop: 10,
    width: 100
  },
  modeIcon: {
    color: '#374D1A',
    marginRight: 15
  },
  modeIconSecond: {
    left: 160,
    top: 10
  },
  modeIconCheck: {
    backgroundColor: 'transparent',
    color: '#D3E7B9',
    position: 'absolute',
    right: 5,
    ...Platform.select({
      android: { top: 15 },
      ios: { top: 20 }
    })
  },
  modeSettingsIcon: {
    height: 40,
    marginBottom: 10
  },
  modeSettingsSection: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    padding: 10
  },
  modeSettingsText: {
    height: 40,
    paddingHorizontal: 5,
    paddingVertical: 10
  },
  numericInput: {
    backgroundColor: '#c9c9c9',
    height: 40,
    padding: 10,
    width: 55
  },
  tabBar: {
    flexDirection: 'row',
    height: 50
  },
  tabBarActive: {
    borderColor: '#F5A729',
    borderBottomWidth: 4
  },
  tabBorderLeft: {
    borderColor: '#000',
    borderLeftWidth: 1
  },
  tabTitle: {
    flex: 1,
    padding: 15
  },
  tabTitleText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  timingHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15
  }
}

const styles: SettingsStyle = StyleSheet.create(settingsStyle)

function isValidDecimal (number: string): boolean {
  return !!number.match(/^\d*(\.\d*)?$/)
}

function isValidNumericText (number: string): boolean {
  return !!number.match(/^\d*$/)
}
