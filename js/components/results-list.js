// @flow

import isEqual from 'lodash.isequal'
import React, { Component } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  ListView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Swiper from 'react-native-swiper'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import DumbTextButton from './dumb-text-button'
import ModeifyIcon from './modeify-icon'
import RouteResult, {getSegmentDetailsForOption} from '../util/route-result'

import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {Location, PlanSearch} from '../types/reducers'
import type {
  ModeifyResult,
  SegmentDetail,
  SegmentDisplay
} from '../types/results'
import type {styleOptions} from '../types/rn-style-config'

type SlideChangeState = {
  autoplayEnd: boolean,
  dir: string,
  height: number,
  index: number,
  isScrolling: boolean,
  loopJump: boolean,
  offset: {
    x: number,
    y: number
  },
  total: number,
  width: number
}

type Props = {
  activeSearch: number,
  changePlanViewState: (string) => void,
  fromLocation: Location,
  modeSettings: {
    bikeSpeed: number,
    walkSpeed: number
  },
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  planPostprocessSettings: {
    drivingCostPerMile: number,
    parkingCost: number
  },
  planViewState: string,
  searches: Array<PlanSearch>,
  setActiveItinerary: ({index: number}) => void,
  toLocation: Location
}

type State = {
  isPending: boolean,
  noPlans?: boolean,
  resultIndex?: number,
  resultText: string
}

export default class ResultsList extends Component {
  props: Props
  routeResult: RouteResult
  state: State

  constructor(props: Props) {
    super(props)
    this.routeResult = new RouteResult()
  }

  state = {
    isPending: true,
    noPlans: true,
    resultIndex: 0,
    resultText: 'No results yet'
  }

  componentWillMount () {
    this.state = this._calculateState(this.props, true)
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState(this._calculateState(nextProps))
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    return nextProps.planViewState !== this.props.planViewState ||
      nextState.isPending !== this.state.isPending ||
      nextState.resultIndex !== this.state.resultIndex
  }

  _calculateState (nextProps: Props, returnFullState?: boolean): State {
    let {resultIndex} = this.state
    const {searches} = nextProps

    if (searches.length === 0) {
      return this.state
    }

    const currentSearch = searches[searches.length - 1]

    const nextState: State = {
      isPending: currentSearch.pending,
      noPlans: false,
      resultText: ''
    }

    this.routeResult.setLocation('from', nextProps.fromLocation)
    this.routeResult.setLocation('to', nextProps.toLocation)
    this.routeResult.setScorerRate(
      'bikeSpeed',
      nextProps.modeSettings.bikeSpeed
    )
    this.routeResult.setScorerRate(
      'walkSpeed',
      nextProps.modeSettings.walkSpeed
    )
    this.routeResult.setScorerRate(
      'carParkingCost',
      nextProps.planPostprocessSettings.parkingCost
    )
    this.routeResult.setScorerRate(
      'mileageRate',
      nextProps.planPostprocessSettings.drivingCostPerMile
    )
    this.routeResult.parseResponse(currentSearch.planResponse)

    if (this.routeResult.hasChanged) {
      nextState.resultIndex = resultIndex + 1
    }

    this.routeResult.hasChanged = false

    const numResults: number = this.routeResult.getResults().length

    if (currentSearch.pending) {
      nextState.resultText = 'Calculating...'
    } else {
      if (this.routeResult.hasError) {
        nextState.resultText = 'An error occurred'
      } else {
        nextState.resultText = `Found ${numResults > 0 ? numResults : 'no'} options`
      }
    }

    if (returnFullState) {
      return Object.assign(this.state, nextState)
    } else {
      return nextState
    }
  }

  _getOptionDetailListviewDatasource (
    option: ModeifyResult
  ): ListView.DataSource {
    if (option.dataSource) return option.dataSource

    const {fromLocation, toLocation} = this.props
    option.dataSource = makeNewDatasourceListview()
    option.dataSource =
      option.dataSource.cloneWithRows(
        getSegmentDetailsForOption(
          option,
          fromLocation,
          toLocation))
    return option.dataSource
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _handleSelectOption = (option: ModeifyResult) => {
    this.props.navigation.navigate('OptionSelected', { option })
  }

  _onCollapsedContainerPress = () => {
    this.props.changePlanViewState('result-summarized')
  }

  _onSlideChange = (e: Object, state: SlideChangeState, context: Object) => {
    this.props.setActiveItinerary({ index: state.index })
  }

  _toggleDetails = (rowId: number) => {
    this.props.changePlanViewState(this.props.planViewState === 'result-summarized'
      ? 'result-expanded'
      : 'result-summarized'
    )
  }

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  _renderCollapsed (): React.Element<*> {
    return (
      <TouchableOpacity
        onPress={this._onCollapsedContainerPress}
        style={styles.summaryTitle}
        >
        <Text style={styles.summaryText}>
          {this.state.resultText}
        </Text>
        <DumbTextButton
          backgroundColor='#F5A729'
          color='#fff'
          containerStyle={{
            position: 'absolute',
            right: 5,
            top: 6
          }}
          text='VIEW RESULTS'
          />
      </TouchableOpacity>
    )
  }

  _renderOptionDetails = (
    optionDetail: SegmentDetail
  ): React.Element<*> => {
    return (
      <View style={[styles.optionDetailsRow, optionDetail.rowStyle]}>
        <View style={styles.optionDetailIcon}>
          {optionDetail.routeStyle && (
            optionDetail.routeStyle.alight ||
            optionDetail.routeStyle.transfer) &&
            <View style={[
                styles.routeStyleAlight,
                {
                  backgroundColor: optionDetail.routeStyle.lastColor,
                }
              ]}
              >
              <Text>&nbsp;</Text>
            </View>
          }
          {optionDetail.routeStyle && optionDetail.routeStyle.take &&
            <View style={[
                styles.routeStyleTake,
                {
                  backgroundColor: optionDetail.routeStyle.color,
                }
              ]}
              >
              <Text>&nbsp;</Text>
            </View>
          }
          {optionDetail.routeStyle && (
            optionDetail.routeStyle.board ||
            optionDetail.routeStyle.transfer) &&
            <View style={[
                styles.routeStyleBoard,
                {
                  backgroundColor: optionDetail.routeStyle.color,
                }
              ]}
              >
              <Text>&nbsp;</Text>
            </View>
          }
          {optionDetail.icon && optionDetail.icon.modeifyIcon &&
            <ModeifyIcon
              color={optionDetail.iconColor}
              name={optionDetail.icon.name}
              size={30}
              />
          }
          {optionDetail.icon && optionDetail.icon.materialIcon &&
            <MaterialIcon
              color={optionDetail.iconColor}
              name={optionDetail.icon.name}
              size={30}
              style={{
                backgroundColor: 'transparent'
              }}
              />
          }
          {optionDetail.icon && optionDetail.icon.fontAwesome &&
            <FontAwesomeIcon
              name={optionDetail.icon.name}
              size={30}
              />
          }
        </View>
        <Text
          style={[
            styles.optionDetailDescription,
            optionDetail.textStyle
          ]}
          >
          {optionDetail.description}
        </Text>
      </View>
    )
  }

  _renderOption = (
    option: ModeifyResult,
    idx: number
  ): React.Element<*> => {
    const screenHeight: number = Dimensions.get('window').height

    const {planViewState} = this.props

    return (
      <View style={styles.optionContent}>
        <View style={styles.optionHeader}>
          <Text style={styles.optionTitle}>
            {option.modeDescriptor}
          </Text>
          {option.costPerTrip &&
            <Text style={styles.cost}>
              $ {option.costPerTrip}
            </Text>
          }
        </View>
        <View style={styles.optionSummary}>
          <View style={styles.segmentsContainer}>
            <View style={styles.segments}>
              {option.segments.map((segment, idx) =>
                <View style={styles.segments}>
                  {['cabi', 'carshare'].indexOf(segment.mode) > -1
                    ? <ModeifyIcon
                        name={segment.mode}
                        size={20}
                        />
                    : <MaterialIcon
                        name={segment.mode}
                        size={20}
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
                            ]}
                            />
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
                  {idx < option.segments.length - 1 &&
                    <MaterialIcon
                      name='menu-right'
                      size={20}
                      />
                  }
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.summaryTimingAndButtons} >
          <View style={styles.selectOptionButton}>
            <TouchableOpacity
              onPress={() => this._handleSelectOption(option)}
              >
              <Text>select</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.optionTimeSummary}>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>
                {option.averageTime}
              </Text>
              <Text style={styles.timeMinutes}>mins</Text>
            </View>
            <View style={styles.walkBikeTimeContainer}>
              {option.freeflowTime &&
                <WalkBikeText
                  text={`${option.freeflowTime} without traffic`}
                  />
              }
              {option.hasTransit && option.bikeDistances > 0 &&
                <WalkBikeText
                  text={`${option.bikeTime} min biking`}
                  />
              }
              {option.hasTransit && option.walkDistances > 0 &&
                <WalkBikeText
                  text={`${option.walkTime} min walking`}
                  />
              }
              {!option.hasTransit && option.bikeDistances > 0 &&
                <WalkBikeText
                  text={`${option.bikeDistances} mi biking`}
                  />
              }
              {!option.hasTransit && option.walkDistances > 0 &&
                <WalkBikeText
                  text={`${option.walkDistances} mi walking`}
                  />
              }
            </View>
          </View>
          <View style={styles.detailsButton}>
            <MaterialIcon.Button
              backgroundColor='#455a71'
              name='plus-circle'
              onPress={() => this._toggleDetails(idx)}
              size={20}
              >
              details
            </MaterialIcon.Button>
          </View>
        </View>
        {planViewState === 'result-expanded' &&
          <View style={{height: screenHeight - 300}}>
            <ListView
              dataSource={this._getOptionDetailListviewDatasource(option)}
              renderRow={this._renderOptionDetails}
            />
          </View>
        }
      </View>
    )
  }

  _renderResults (): React.Element<*> {
    const screenHeight: number = Dimensions.get('window').height

    const {searches} = this.props
    const {isPending, resultText} = this.state

    const currentSearch: PlanSearch = searches[searches.length - 1]
    const slideIdx: number = (
      currentSearch && currentSearch.activeItinerary > -1
        ? currentSearch.activeItinerary
        : 0
    )

    const allOptions: Array<ModeifyResult> = this.routeResult.getResults()
    const bestOptionsByMode: Array<ModeifyResult> = (
      this.routeResult.getBestOptionsByMode()
    )
    const hasResults: boolean = allOptions.length > 0

    const slides: Array<React.Element<*>> = []

    if (isPending) {
      slides.push(
        <View>
          <View style={styles.summaryTitle}>
            <Text style={styles.summaryText}>
              {resultText}
            </Text>
          </View>
          <ActivityIndicator
            animating
            size='large'
            style={styles.summaryLoading}
            />
        </View>
      )
    } else {
      let content: React.Element<*>

      if (hasResults) {
        content = (
          <View
            key='modeify-summary'
            style={styles.summaryAllOptions}
            >
            <View style={styles.summarizedModesContainer}>
              {bestOptionsByMode.map((option: ModeifyResult) =>
                <SummarizedMode
                  option={option}
                  />
              )}
            </View>
            <Text
              style={styles.summaryText}
              >
              Swipe to view each option
            </Text>
          </View>
        )
      } else {
        content = (
          <View style={styles.summaryAllOptions}>
            <Text
              style={styles.summaryText}
              >
              No results found between these locations!  Try changing the starting or ending location.
            </Text>
          </View>
        )
      }

      slides.push(
        <View style={styles.summaryContent}>
          <View style={styles.summaryTitle}>
            <Text style={styles.summaryText}>
              {resultText}
            </Text>
          </View>
          {content}
        </View>
      )

      allOptions.forEach((option: ModeifyResult, idx: number) => {
        slides.push(this._renderOption(option, idx))
      })
    }

    return (
      <Swiper
        index={slideIdx}
        onMomentumScrollEnd={this._onSlideChange}
        >
        {slides}
      </Swiper>
    )
  }

  render (): ?React.Element<*> {
    switch (this.props.planViewState) {
      case 'init':
        return null
      case 'result-collapsed':
        return this._renderCollapsed()
      case 'result-summarized':
      case 'result-expanded':
        return this._renderResults()
    }
  }
}

// ------------------------------------------------------------------------
// helper components
// ------------------------------------------------------------------------

const SummarizedMode = (props: {option: ModeifyResult}) : React.Element<*> => (
  <View style={styles.summarizedModeContainer}>
    {['cabi', 'carshare'].indexOf(props.option.dominantModeIcon) > -1
      ? <ModeifyIcon
          color='#fff'
          name={props.option.dominantModeIcon}
          size={20}
          />
      : <MaterialIcon
          color='#fff'
          name={props.option.dominantModeIcon}
          size={20}
          />
    }
    <Text
      style={styles.summarizedModeTime}
      >
      {props.option.averageTime} mins
    </Text>
  </View>
)

const WalkBikeText = (props: {text: string}): React.Element<*> => (
  <Text
    style={styles.walkBikeTimeText}
    >
    {props.text}
  </Text>
)

function makeNewDatasourceListview (): ListView.DataSource  {
  return new ListView.DataSource({
    rowHasChanged: (
      row1: any,
      row2: any
    ): boolean => row1 !== row2
  })
}


type ResultListStyle = {
  cost: styleOptions,
  detailsButton: styleOptions,
  optionContent: styleOptions,
  optionDetailDescription: styleOptions,
  optionDetailsRow: styleOptions,
  optionDetailIcon: styleOptions,
  optionHeader: styleOptions,
  optionSummary: styleOptions,
  optionTimeSummary: styleOptions,
  optionTitle: styleOptions,
  routeStyleAlight: styleOptions,
  routeStyleBoard: styleOptions,
  routeStyleTake: styleOptions,
  segmentRouteBackground: styleOptions,
  segments: styleOptions,
  segmentsContainer: styleOptions,
  segmentShortName: styleOptions,
  segmentShortNameStroke: styleOptions,
  segmentShortNameContainer: styleOptions,
  selectOptionButton: styleOptions,
  summarizedModeContainer: styleOptions,
  summarizedModesContainer: styleOptions,
  summarizedModeTime: styleOptions,
  summaryAllOptions: styleOptions,
  summaryContent: styleOptions,
  summaryLoading: styleOptions,
  summaryText: styleOptions,
  summaryTimingAndButtons: styleOptions,
  summaryTitle: styleOptions,
  time: styleOptions,
  timeContainer: styleOptions,
  timeMinutes: styleOptions,
  walkBikeTimeText: styleOptions,
  walkBikeTimeContainer: styleOptions
}

const resultListStyle: ResultListStyle = {
  cost: {
    backgroundColor: '#8ec449',
    bottom: 3,
    color: '#394e1d',
    fontWeight: 'bold',
    paddingRight: 4,
    paddingTop: 3,
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 3,
    width: 70
  },
  detailsButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 100
  },
  optionContent: {
    backgroundColor: '#fff'
  },
  optionDetailDescription: {
    paddingTop: 11
  },
  optionDetailsRow: {
    flexDirection: 'row',
    minHeight: 40
  },
  optionDetailIcon: {
    paddingLeft: 10,
    paddingVertical: 5,
    width: 50
  },
  optionHeader: {
    backgroundColor: '#455a71',
    padding: 5
  },
  optionSummary: {
    backgroundColor: '#fff',
    padding: 10
  },
  optionTimeSummary: {
    alignItems: 'center'
  },
  optionTitle: {
    color: '#fff',
    fontSize: 16
  },
  routeStyleAlight: {
    height: 20,
    left: 13,
    position: 'absolute',
    top: 0,
    width: 24
  },
  routeStyleBoard: {
    height: 30,
    left: 13,
    position: 'absolute',
    top: 17,
    width: 24
  },
  routeStyleTake: {
    bottom: 0,
    left: 13,
    position: 'absolute',
    top: 0,
    width: 24
  },
  segmentRouteBackground: {
    flex: 1
  },
  segments: {
    flexDirection: 'row'
  },
  segmentsContainer: {
    alignItems: 'center'
  },
  segmentShortName: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    top: 2
  },
  segmentShortNameStroke: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    color: '#455a71',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#455a71',
    textShadowOffset: {
      height: 1,
      width: 1
    },
    top: 2
  },
  segmentShortNameContainer: {
    borderColor: '#edeff0',
    borderRadius: 7,
    borderStyle: 'solid',
    borderWidth: 1,
    flexDirection: 'row',
    height: 20,
    marginLeft: 5,
    overflow: 'hidden',
    width: 30
  },
  selectOptionButton: {
    backgroundColor: '#DD9719',
    borderRadius: 5,
    left: 10,
    padding: 10,
    position: 'absolute',
    top: 10,
    width: 60
  },
  summarizedModeContainer: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 10,
    padding: 5
  },
  summarizedModesContainer: {
    flexDirection: 'row',
    marginBottom: 5
  },
  summarizedModeTime: {
    color: '#fff',
    marginLeft: 5
  },
  summaryAllOptions: {
    alignItems: 'center',
    height: 1000,
    margin: 10
  },
  summaryContent: {
    backgroundColor: '#5a7491'
  },
  summaryLoading: {
    padding: 15
  },
  summaryText: {
    color: '#fff',
    fontSize: 16
  },
  summaryTimingAndButtons: {
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 60
  },
  summaryTitle: {
    backgroundColor: '#455a71',
    padding: 10
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5
  },
  timeContainer: {
    flexDirection: 'row'
  },
  timeMinutes: {
    fontSize: 18
  },
  walkBikeTimeText: {
    color: '#748395'
  },
  walkBikeTimeContainer: {
    alignItems: 'center'
  }
}

const styles: ResultListStyle = StyleSheet.create(resultListStyle)
