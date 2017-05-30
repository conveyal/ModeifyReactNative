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

import type {Location} from '../types/reducers'
import type {
  ModeifyResult,
  SegmentDetail,
  SegmentDisplay
} from '../types/results'
import type {styleOptions} from '../types/rn-style-config'

type SearchResult = {
  pending: boolean,
  planResponse: RouteResult
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
  searches: Array<SearchResult>,
  toLocation: Location
}

type RowDetailToggle = {
  [key: number]: boolean
}

type State = {
  isPending: boolean,
  noPlans?: boolean,
  options: ListView.DataSource,
  resultIndex?: number,
  resultText: string,
  rowDetailToggle: RowDetailToggle
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
    options: makeNewDatasourceListview(),
    resultIndex: 0,
    resultText: 'No results yet',
    rowDetailToggle: {}
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
      nextState.resultIndex !== this.state.resultIndex ||
      !isEqual(nextState.rowDetailToggle, this.state.rowDetailToggle)
  }

  _calculateState (nextProps: Props, returnFullState?: boolean): State {
    const {options, rowDetailToggle} = this.state
    let {resultIndex} = this.state
    const {searches} = nextProps

    if (searches.length === 0) {
      return this.state
    }

    const currentSearch = searches[searches.length - 1]

    const nextState: State = {
      isPending: currentSearch.pending,
      noPlans: false,
      options,
      resultText: '',
      rowDetailToggle
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
      nextState.options = this._getRows({})
      nextState.resultIndex = resultIndex + 1
      nextState.rowDetailToggle = {}
    }

    this.routeResult.hasChanged = false

    const numResults: number = nextState.options.getRowCount()

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

  _getRows (nextRowDetailToggle: RowDetailToggle): ListView.DataSource {
    const results = this.routeResult.getResults()
    let rows = results && results.length > 0
      ? results.map((result, idx) => {
          if (nextRowDetailToggle[idx]) {
            // return a new object so ListView re-renders
            return Object.assign({}, result)
          }
          return result
        })
      : []
    return this.state.options.cloneWithRows(rows)
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

  _toggleDetails = (rowId: number) => {
    const nextRowDetailToggle: RowDetailToggle = Object.assign(
      {},
      this.state.rowDetailToggle
    )
    nextRowDetailToggle[rowId] = !nextRowDetailToggle[rowId]
    this.setState({
      options: this._getRows(nextRowDetailToggle),
      rowDetailToggle: nextRowDetailToggle
    })
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

  _renderExpanded (): React.Element<*> {
    const screenHeight: number = Dimensions.get('window').height
    return (
      <ScrollView>
        <Text>{this.state.resultText}</Text>
      </ScrollView>
    )
  }

  _renderOptionDetails = (
    optionDetail: SegmentDetail,
    listSectionID: string,
    listRowID: number
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
    listSectionID: string,
    listRowID: number
  ): React.Element<*> => {
    const {rowDetailToggle} = this.state

    return (
      <View style={styles.optionCard}>
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
        <View style={styles.optionContent}>
          <View style={styles.segments} >
            {option.segments.map((
              segment: SegmentDisplay,
              idx: number
            ): React.Element<*> =>
              <View style={styles.segmentRow}>
                <View>
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
                  {idx < option.segments.length - 1 &&
                    <MaterialIcon
                      name='menu-down'
                      size={20}
                      style={styles.transferIcon}
                      />
                  }
                </View>
                <View
                  style={styles.segmentShortNameContainer}
                  >
                  {segment.background &&
                    segment.background.length > 0 &&
                    segment.background.map((
                      color: string
                    ): React.Element<*> =>
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
              </View>
            )}
          </View>
          <View style={styles.summary} >
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
            <View style={styles.selectOptionButton}>
              <TouchableOpacity
                onPress={() => this._handleSelectOption(option)}
                >
                <Text>select</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.detailsButton}>
              <MaterialIcon.Button
                backgroundColor='#455a71'
                name='plus-circle'
                onPress={() => this._toggleDetails(listRowID)}
                >
                details
              </MaterialIcon.Button>
            </View>
          </View>
        </View>
        {rowDetailToggle && rowDetailToggle[listRowID] &&
          <ListView
            dataSource={this._getOptionDetailListviewDatasource(option)}
            renderRow={this._renderOptionDetails}
          />
        }
      </View>
    )
  }

  _renderResult (): React.Element<*> {
    const {noPlans, isPending, options} = this.state

    const numResults: number = options.getRowCount()
    const hasResults: boolean = numResults > 0

    if (noPlans) {
      return (
        <View>
          <Text style={styles.infoText}>No results yet!</Text>
          <Text style={styles.infoText}>
            Select your locations to view your commuting options
          </Text>
        </View>
      )
    }

    return (
      <View>
        {isPending &&
          <Text style={styles.infoText}>Calculating...</Text>
        }
        {!isPending && !hasResults &&
          <Text style={styles.infoText}>No results found between these locations!</Text>
        }
        {this.routeResult.hasError &&
          <Text style={styles.infoText}>An error occurred.  Please try again!</Text>
        }
        {!isPending && hasResults &&
          <View>
            <Text style={styles.infoText}>
              {`Found ${numResults > 0 ? numResults : 'no'} options`}
            </Text>
            <ListView
              dataSource={options}
              renderRow={this._renderOption}
            />
          </View>
        }
      </View>
    )
  }

  _renderSummarized (): React.Element<*> {
    const screenHeight: number = Dimensions.get('window').height

    const {isPending, resultText} = this.state

    const bestOptionsByMode = this.routeResult.getBestOptionsByMode()

    return (
      <View>
        <View style={styles.summaryTitle}>
          <Text style={styles.summaryText}>
            {resultText}
          </Text>
        </View>
        <View style={styles.summaryContent}>
          {isPending &&
            <ActivityIndicator
              animating
              size='large'
              />
          }
          {!isPending &&
            <View style={styles.summaryAllOptions}>
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
          }
        </View>
      </View>
    )
  }

  render (): ?React.Element<*> {
    switch (this.props.planViewState) {
      case 'init':
        return null
      case 'result-collapsed':
        return this._renderCollapsed()
      case 'result-summarized':
        return this._renderSummarized()
      case 'result-expanded':
        return this._renderExpanded()
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
  infoText: styleOptions,
  modeIcon: styleOptions,
  optionCard: styleOptions,
  optionContent: styleOptions,
  optionDetailDescription: styleOptions,
  optionDetailsRow: styleOptions,
  optionDetailIcon: styleOptions,
  optionHeader: styleOptions,
  optionTitle: styleOptions,
  resultListContainer: styleOptions,
  routeStyleAlight: styleOptions,
  routeStyleBoard: styleOptions,
  routeStyleTake: styleOptions,
  segmentRow: styleOptions,
  segmentRouteBackground: styleOptions,
  segments: styleOptions,
  segmentShortName: styleOptions,
  segmentShortNameStroke: styleOptions,
  segmentShortNameContainer: styleOptions,
  selectOptionButton: styleOptions,
  summarizedModeContainer: styleOptions,
  summarizedModesContainer: styleOptions,
  summarizedModeTime: styleOptions,
  summary: styleOptions,
  summaryAllOptions: styleOptions,
  summaryContent: styleOptions,
  summaryText: styleOptions,
  summaryTitle: styleOptions,
  time: styleOptions,
  timeContainer: styleOptions,
  timeMinutes: styleOptions,
  transferIcon: styleOptions,
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
    bottom: 5,
    position: 'absolute',
    right: 5,
    width: 100
  },
  infoText: {
    color: '#fff',
    fontSize: 16
  },
  modeIcon: {...Platform.select({
    android: {
      height: 29
    },
    ios: {
      height: 28
    }
  })},
  optionCard: {
    borderRadius: 5,
    marginVertical: 5
  },
  optionContent: {
    flexDirection: 'row',
    minHeight: 90
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
  optionTitle: {
    color: '#fff',
    fontSize: 14
  },
  resultListContainer: {
    backgroundColor: '#5a7491',
    paddingHorizontal: 10,
    paddingBottom: 50,
    paddingTop: 10
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
  segmentRow: {
    flexDirection: 'row'
  },
  segmentRouteBackground: {
    flex: 1
  },
  segments: {
    backgroundColor: '#edeff0',
    padding: 5,
    width: 90
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
  selectOptionButton: {
    backgroundColor: '#DD9719',
    borderRadius: 5,
    padding: 10,
    position: 'absolute',
    right: 5,
    top: 5,
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
  summary: {
    backgroundColor: '#fff',
    flex: 1
  },
  summaryAllOptions: {
    alignItems: 'center'
  },
  summaryContent: {
    backgroundColor: '#5a7491',
    height: 100,
    padding: 10
  },
  summaryText: {
    color: '#fff',
    fontSize: 16
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
    flexDirection: 'row',
    height: 40,
    left: 10,
    position: 'absolute',
    top: 10
  },
  timeMinutes: {
    fontSize: 18
  },
  transferIcon: {
    height: 15,
    paddingLeft: 3
  },
  walkBikeTimeText: {
    color: '#748395'
  },
  walkBikeTimeContainer: {
    marginLeft: 10,
    marginTop: 36
  }
}

const styles: ResultListStyle = StyleSheet.create(resultListStyle)
