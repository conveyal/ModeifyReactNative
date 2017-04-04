// @flow

import React, { Component } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import ModeifyIcon from './modeify-icon'

export default class Settings extends Component {
  state = {
    activeTab: 'modes'
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _toggleMode (mode) {
    const {currentQuery, setMode} = this.props
    const newMode = Object.assign({}, currentQuery.mode)
    newMode[mode] = !newMode[mode]
    setMode({ mode: newMode })
  }

  _onBikePress = () => {
    this._toggleMode('bike')
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

  _onRailPress = () => {
    this._toggleMode('rail')
  }

  _onWalkPress = () => {
    this._toggleMode('walk')
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
    console.log(this.props.currentQuery)

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
      </View>
    )
  }

  render () {
    const {activeTab} = this.state

    return (
      <View>
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 10,
    paddingVertical: 20
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
    top: 20
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
