// @flow

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

import ModeifyIcon from './modeify-icon'
import headerStyles from '../util/header-styles'

const bikeSpeedOptions = ['4 mph', '6 mph', '8 mph', '10 mph']
const bikeSpeedValues = [4, 6, 8, 10]
const bikeTrafficStressOptions = ['Level 1', 'Level 2', 'Level 3', 'Level 4']
const bikeTrafficStressValues = [1, 2, 3, 4]
const walkSpeedOptions = ['2 mph', '3 mph', '4 mph']
const walkSpeedValues = [2, 3, 4]

type Props = Object

type State = {
  activeTab: string;
}

export default class Settings extends Component {
  state: State

  static navigationOptions = {
    header: ({ state, setParams }) => ({
      style: headerStyles.nav,
      tintColor: '#fff',
      title: 'SETTINGS',
      titleStyle: headerStyles.title
    })
  }

  constructor (props: Props) {
    super(props)

    this.state = {
      activeTab: 'modes'
    }
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _onBikePress = () => {
    this._toggleMode('bike')
  }

  _onBikeSpeedChange = (idx) => {
    this._setModeSetting('bikeSpeed', bikeSpeedValues[idx])
  }

  _onBikeMaxTimeChange = (text) => {
    if (!isValidNumericText(text)) {
      return
    }
    this._setModeSetting('maxBikeTime', text)
  }

  _onBikeTrafficStressChange = (idx) => {
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

  _onDrivingCostPerMileChange = (text) => {
    if (!isValidDecimal(text)) {
      return
    }
    this._setPostprocessSetting('drivingCostPerMile', text)
  }

  _onParkingCostChange = (text) => {
    if (!isValidDecimal(text)) {
      return
    }
    this._setPostprocessSetting('parkingCost', text)
  }

  _onRailPress = () => {
    this._toggleMode('rail')
  }

  _onWalkMaxTimeChange = (text) => {
    if (!isValidNumericText(text)) {
      return
    }
    this._setModeSetting('maxWalkTime', text)
  }

  _onWalkPress = () => {
    this._toggleMode('walk')
  }

  _onWalkSpeedChange = (idx) => {
    this._setModeSetting('walkSpeed', walkSpeedValues[idx])
  }

  _setModeSetting (key: string, value: string) {
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

  _toggleMode (mode) {
    const {currentQuery, setMode} = this.props
    const newMode = Object.assign({}, currentQuery.mode)
    newMode[mode] = !newMode[mode]
    setMode({ mode: newMode })
  }

  _toggleTab = () => {
    this.setState({
      activeTab: this.state.activeTab === 'modes' ? 'general' : 'modes'
    })
  }

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  _renderGeneralContent () {

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
    )
  }
}

const styles = StyleSheet.create({
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
  }
})

function isValidDecimal (number) {
  return !!number.match(/^\d*(\.\d*)?$/)
}

function isValidNumericText (number) {
  return !!number.match(/^\d*$/)
}
