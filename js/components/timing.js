// @flow

import moment from 'moment'
import React, { Component } from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import ModalDropdown from 'react-native-modal-dropdown'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import Header from './header'
import tracker from '../util/analytics'
import {
  dayOfWeekOptions,
  endHourOptions,
  endHourValues,
  getDayType,
  getTimeValue,
  startHourOptions,
  startHourValues
} from '../util/date-time'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {
  CurrentQuery,
  ModeifyTiming
} from '../types/reducers'
import type {styleOptions} from '../types/rn-style-config'

type Props = {
  currentQuery: CurrentQuery,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  setDate: ({ date: string }) => void,
  setTime: ({ time: ModeifyTiming }) => void
}


export default class Timing extends Component {
  props: Props

  static navigationOptions = {
    drawerLabel: 'TIMING',
    drawerIcon: ({ tintColor }) => (
      <MaterialIcon
        name='clock'
        size={24}
        style={{ color: tintColor }}
        />
    )
  }

  componentDidMount () {
    tracker.trackScreenView('Timing')
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

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

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  render () {
    const {currentQuery} = this.props
    return (
      <View style={styles.container}>
        <Header
          left={{back: true}}
          navigation={this.props.navigation}
          right={{close: true}}
          title='TIMING'
          />
        <ScrollView style={styles.content}>
          <Text style={styles.timingHeader}>Day of Week</Text>
          <ModalDropdown
            defaultValue={getDayType(currentQuery.date)}
            dropdownTextStyle={styles.dropdownText}
            onSelect={this._onDayOfWeekChange}
            options={dayOfWeekOptions}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            />
          <Text style={styles.timingHeader}>From</Text>
          <ModalDropdown
            defaultValue={getTimeValue('start', currentQuery)}
            dropdownTextStyle={styles.dropdownText}
            onSelect={this._onStartHourChange}
            options={startHourOptions}
            ref='startTime'
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            />
          <Text style={styles.timingHeader}>To</Text>
          <ModalDropdown
            defaultValue={getTimeValue('end', currentQuery)}
            dropdownTextStyle={styles.dropdownText}
            onSelect={this._onEndHourChange}
            options={endHourOptions}
            ref='endTime'
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            />
        </ScrollView>
      </View>
    )
  }
}

type TimingStyle = {
  container: styleOptions,
  content: styleOptions,
  dropdown: styleOptions,
  dropdownText: styleOptions,
  timingHeader: styleOptions
}

const settingsStyle: TimingStyle = {
  container: Platform.select({
    ios: {},
    android: {
      backgroundColor: '#fff',
      flex: 1
    },
  }),
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
  timingHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15
  }
}

const styles: TimingStyle = StyleSheet.create(settingsStyle)
