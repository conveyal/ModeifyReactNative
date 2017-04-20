// @flow

import currencyFormatter from 'currency-formatter'
import React, { Component } from 'react'
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import ModeifyIcon from './modeify-icon'
import headerStyles from '../util/header-styles'
import {getResourcesByTag} from '../util/route-option-resource'
import {getOptionTags} from '../util/route-result'

import type {Location} from '../types'


const workTripsPerYear = 235

type Props = {
  fromLocation: Location,
  toLocation: Location
}

export default class OptionSelected extends Component {

  static navigationOptions = {
    header: ({ state, setParams }) => ({
      style: headerStyles.nav,
      tintColor: '#fff',
      title: 'YOUR SELECTION',
      titleStyle: headerStyles.title
    })
  }

  state = {
    expandedResources: {},
    resources: []
  }

  componentWillMount () {
    const {fromLocation, navigation, toLocation} = this.props
    const {option} = navigation.state.params

    getResourcesByTag(
      getOptionTags(option, fromLocation, toLocation),
      (err, resources) => {
        if (resources) this.setState({ resources })
      }
    )
  }

  _onLoginPress = () => {

  }

  _onSignUpPress = () => {

  }

  _onTapUrl = (url) => {
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          console.log('Can\'t handle url: ' + url)
        } else {
          return Linking.openURL(url)
        }
      })
      .catch(err => console.error('An error occurred', err))
  }

  _toggleResource = (idx) => {
    const {expandedResources} = this.state
    expandedResources[idx] = !expandedResources[idx]
    this.setState({ expandedResources })
  }

  _renderAccountContent () {
    const {option} = this.props.navigation.state.params
    if (option.directCar) {
      return (
        <View style={styles.carpoolContainer}>
          <Text style={styles.carpoolHeader}>
            Interested in carpooling with us?
          </Text>
          <Text>
            Join our network to be matched with commuters in your neighborhood soon!
          </Text>
          <Text
            onPress={this._onLoginPress}
            style={styles.signUpButtonText}
            >
            Sign up for carpooling
          </Text>
        </View>
      )
    } else {
      return (
        <View>
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpTitle}>
              Sign up for CarFreeAtoZ
            </Text>
            <Text style={styles.signUpText}>
              Create a free account to access special features and receive future updates!
            </Text>
            <TouchableOpacity
              onPress={this._onSignUpPress}
              >
              <Text style={styles.signUpButtonText}>Sign up!</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.loginContainer}>
            <View style={styles.loginTextContainer}>
              <Text style={styles.loginText}>Already have an account?  </Text>
              <TouchableOpacity
                onPress={this._onLoginPress}
                >
                <Text style={[styles.loginText, styles.loginTouchableText]}>
                  Log in here.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )
    }
  }

  _renderCarComparison () {
    const {option} = this.props.navigation.state.params
    const weightLost = Math.round(option.weightLost * workTripsPerYear)
    const emissionsDifference = Math.floor(option.emissionsDifference)
    const timeSavings = Math.floor(option.timeSavings * workTripsPerYear)

    return (
      <View>
        <Text style={styles.congrats}>Congrats! Compared to driving solo, you:</Text>
        {option.costSavings &&
          <ComparisonRow
            action='Save'
            iconColor='#A8D05D'
            iconName='money'
            metric={currencyFormatter.format(
              option.costSavings * workTripsPerYear,
              { code: 'USD' }
            )}
            metricDescription=' on traveling'
            />
        }
        {weightLost > 0 &&
          <ComparisonRow
            action='Lose'
            iconColor='#3CABD0'
            iconName='scale'
            metric={`${weightLost} lbs`}
            metricDescription=' from excercise'
            />
        }
        {emissionsDifference > 0 &&
          <ComparisonRow
            action='Reduce CO2 emissions by'
            iconColor='#F8CD27'
            iconName='leaf'
            metric={`${emissionsDifference}%`}
            metricDescription=''
            />
        }
        {timeSavings > 0 &&
          <ComparisonRow
            action='Gain'
            iconColor='#E21836'
            iconName='book'
            metric={`${timeSavings} hour(s)`}
            metricDescription=' of productive time'
            />
        }
        <Text style={styles.footnote}>*estimated yearly</Text>
      </View>
    )
  }

  _renderResources () {
    const {expandedResources, resources} = this.state

    return (
      <View>
        {resources.map((resource, idx) => (
          <View style={styles.resourceContainer}>
            <MaterialIcon.Button
              color='#000'
              name='plus-circle'
              onPress={() => this._toggleResource(idx)}
              style={styles.resourceButton}
              >
              {resource.title}
            </MaterialIcon.Button>
            {!!expandedResources[idx] &&
              <Text style={styles.resourceText}>
                {resource.parsedNodes.map(node => (
                  <Text
                    onPress={node.type === 'link'
                      ? () => this._onTapUrl(node.link)
                      : undefined}
                    style={node.type === 'link' ? styles.resourceLink : {}}
                    >
                    {node.text}
                  </Text>
                ))}
              </Text>
            }
          </View>
        ))}
      </View>
    )
  }

  _renderSegments () {
    const {option} = this.props.navigation.state.params

    const segmentRows = []
    let curSegmentRow = []
    option.segments.forEach((segment, idx) => {
      curSegmentRow.push(segment)
      if (3 % (idx + 1) === 0 && idx > 0) {
        segmentRows.push(curSegmentRow)
        curSegmentRow = []
      }
    })
    if (curSegmentRow.length > 0) segmentRows.push(curSegmentRow)

    return (
      <View>
        {segmentRows.map((segmentRow, segmentIdx) =>
          <View style={styles.segmentsContainer}>
            <View style={styles.segments}>
              {segmentRow.map((segment, idx) =>
                <View style={styles.segments}>
                  {['cabi', 'carshare'].indexOf(segment.mode) > -1
                    ? <ModeifyIcon
                        name={segment.mode}
                        size={30}
                        style={styles.modeIcon}
                        />
                    : <MaterialIcon
                        name={segment.mode}
                        size={30}
                        style={styles.modeIcon}
                        />
                  }
                  {segment.shortName &&
                    <View
                      style={styles.segmentShortNameContainer}
                      >
                      {segment.background &&
                        segment.background.map((color) =>
                          <View style={[
                              styles.segmentRouteBackground,
                              {
                                backgroundColor: color
                              }
                            ]} />
                      )}
                      <Text
                        style={styles.segmentShortNameStroke}
                        >
                        {segment.shortName}
                      </Text>
                      <Text
                        style={styles.segmentShortName}
                        >
                        {segment.shortName}
                      </Text>
                    </View>
                  }
                  {idx + segmentIdx * 3 < option.segments.length - 1 &&
                    <MaterialIcon
                      name='menu-right'
                      size={30}
                      style={styles.transferIcon}
                      />
                  }
                </View>
              )}
            </View>
          </View>
        )}
        <View style={styles.selectionTitle}>
          <Text
            style={styles.selectionTitleText}
            >
            You selected {option.modeDescriptor}!
          </Text>
        </View>
      </View>
    )
  }

  render () {
    return (
      <ScrollView
        style={styles.container}
        >
        {this._renderSegments()}
        {this._renderCarComparison()}
        {this._renderAccountContent()}
        {this._renderResources()}
      </ScrollView>
    )
  }
}

const ComparisonRow = (props) => (
  <View style={styles.comparisonRow}>
    <View style={styles.comparisonIcon}>
      {props.iconName === 'leaf'
        ? <MaterialIcon
            color={props.iconColor}
            name={props.iconName}
            size={30}
            />
        : <ModeifyIcon
            color={props.iconColor}
            name={props.iconName}
            size={30}
            />
      }
    </View>
    <Text style={styles.comparisonText}>
      <Text>{props.action}</Text>
      <Text style={styles.bold}> {props.metric}</Text>
      <Text>{props.metricDescription}!</Text>
    </Text>
  </View>
)

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold'
  },
  carpoolContainer: {
    marginVertical: 10
  },
  carpoolHeader: {
    fontSize: 18,
    marginVertical: 10
  },
  comparisonIcon: {
    alignItems: 'center',
    width: 40,
  },
  comparisonRow: {
    backgroundColor: '#cfe5f9',
    flexDirection: 'row',
    marginBottom: 3,
    padding: 5
  },
  comparisonText: {
    fontSize: 14,
    marginLeft: 10,
    paddingTop: 5
  },
  congrats: {
    fontSize: 14,
    marginBottom: 10
  },
  container: {
    backgroundColor: '#fff',
    padding: 10
  },
  footnote: {
    fontSize: 11,
    textAlign: 'right'
  },
  loginContainer: {
    alignItems: 'center',
    marginVertical: 15
  },
  loginText: {
    fontSize: 16
  },
  loginTextContainer: {
    flexDirection: 'row'
  },
  loginTouchableText: {
    color: '#DD9719',
    fontWeight: 'bold'
  },
  resourceButton: {
    backgroundColor: '#fff'
  },
  resourceContainer: {
    borderColor: '#e0e0e0',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 3
  },
  resourceLink: {
    color: '#DD9719',
    fontWeight: 'bold'
  },
  resourceText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10
  },
  segmentRouteBackground: {
    flex: 1
  },
  segments: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  segmentsContainer: {
    alignItems: 'center'
  },
  segmentShortName: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    color: '#fff',
    textAlign: 'center',
    top: 5
  },
  segmentShortNameStroke: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    color: '#455a71',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#455a71',
    textShadowOffset: {
      height: 1,
      width: 1
    },
    top: 5
  },
  segmentShortNameContainer: {
    borderColor: '#edeff0',
    borderRadius: 7,
    borderStyle: 'solid',
    borderWidth: 1,
    flexDirection: 'row',
    height: 30,
    marginLeft: 5,
    overflow: 'hidden',
    width: 45
  },
  selectionTitle: {
    alignItems: 'center',
    padding: 20
  },
  selectionTitleText: {
    fontSize: 18
  },
  signUpButtonText: {
    backgroundColor: '#DD9719',
    fontSize: 16,
    marginTop: 10,
    paddingVertical: 10,
    textAlign: 'center'
  },
  signUpContainer: {
    backgroundColor: '#DFF0D8',
    borderColor: '#d6e9c6',
    borderWidth: 1,
    marginTop: 10,
    padding: 10
  },
  signUpText: {
    color: '#3c763d'
  },
  signUpTitle: {
    color: '#3c763d',
    fontWeight: 'bold',
    paddingVertical: 10
  }
})
