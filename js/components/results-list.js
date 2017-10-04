// @flow

import isEqual from 'lodash.isequal'
import React, { Component } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
import {createDataSource} from '../util'
import {getBestOptionsByMode, getSegmentDetailsForOption} from '../util/route-result'

import type {Element} from 'react'
import type {
  NavigationAction,
  NavigationRoute,
  NavigationScreenProp
} from 'react-navigation/src/TypeDefinition'

import type {CurrentQuery, Location} from '../types/query'
import type {PlanSearch} from '../types/reducers'
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
  changePlanViewState: (string) => void,
  currentQuery: CurrentQuery,
  currentSearch: PlanSearch,
  navigation: NavigationScreenProp<NavigationRoute, NavigationAction>,
  planViewState: string,
  setActiveItinerary: ({index: number}) => void
}

export default class ResultsList extends Component<Props> {

  _getResultText () {
    const {currentSearch} = this.props
    const numResults = currentSearch && currentSearch.postProcessedResults
      // $FlowFixMe ignoring silly flow error
      ? currentSearch.postProcessedResults.length
      : 0

    if (!currentSearch || currentSearch.pending) {
      return 'Calculating...'
    } else {
      if (currentSearch.planResponse.error) {
        return 'An error occurred'
      } else {
        return `Found ${numResults > 0 ? numResults : 'no'} options`
      }
    }
  }

  _getOptionDetailListviewDatasource (
    option: ModeifyResult
  ): ListView.DataSource {
    if (option.dataSource) return option.dataSource

    const {from, to} = this.props.currentQuery
    option.dataSource = createDataSource()
    option.dataSource =
      option.dataSource.cloneWithRows(
        getSegmentDetailsForOption(
          option,
          from,
          to))
    return option.dataSource
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _handleSelectOption = (option: ModeifyResult) => {
    this.props.navigation.navigate('OptionSelected', { option })
  }

  _handlePressSummarized (option: ModeifyResult) {
    // find the first result matching the option
    const {currentSearch} = this.props
    const allOptions: Array<ModeifyResult> = (
      // $FlowFixMe ignoring silly flow error
      currentSearch && currentSearch.postProcessedResults
        ? currentSearch.postProcessedResults
        : []
    )

    for (let i = 0; i < allOptions.length; i++) {
      if (allOptions[i].dominantMode === option.dominantMode) {
        this.refs.swiper.scrollBy(i + 1, true)
        return this.props.setActiveItinerary({ index: i + 1 })
      }
    }
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

  _renderCollapsed (): Element<*> {
    return (
      <TouchableOpacity
        onPress={this._onCollapsedContainerPress}
        style={styles.summaryTitle}
        >
        <Text style={styles.summaryText}>
          {this._getResultText()}
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
  ): Element<*> => {
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
          {optionDetail.icon && optionDetail.icon.stopImage &&
            <Image
              source={require('../../assets/stop-dot-100.png')}
              style={styles.stopImage}
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
    expandedHeight: number,
    idx: number,
    option: ModeifyResult
  ): Element<*> => {

    const {planViewState} = this.props

    let walkBikeText: string = ''
    let shouldOffsetWalkBikeText: boolean = false

    function addText (s: string) {
      if (walkBikeText.length > 0) {
        walkBikeText += ', '
        shouldOffsetWalkBikeText = true
      }
      walkBikeText += s
    }

    if (option.freeflowTime) {
      addText(`${option.freeflowTime} w/o traffic`)
    }

    if (option.hasTransit && option.bikeDistances > 0) {
      addText(`${option.bikeTime} min bike`)
    }

    if (option.hasTransit && option.walkDistances > 0) {
      addText(`${option.walkTime} min walk`)
    }

    if (!option.hasTransit && option.bikeDistances > 0) {
      addText(`${option.bikeDistances} mi bike`)
    }

    if (!option.hasTransit && option.walkDistances > 0) {
      addText(`${option.walkDistances} mi walk`)
    }

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
              <Text
                style={[
                  styles.walkBikeTimeText,
                  shouldOffsetWalkBikeText
                    ? styles.walkBikeTextOffset
                    : null
                ]}
                >
                {walkBikeText}
              </Text>
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
          <View style={{height: expandedHeight}}>
            <ListView
              dataSource={this._getOptionDetailListviewDatasource(option)}
              renderRow={this._renderOptionDetails}
            />
          </View>
        }
      </View>
    )
  }

  _renderResults (): Element<*> {
    const {currentQuery, currentSearch, planViewState} = this.props
    const screenHeight: number = Dimensions.get('window').height

    const allOptions: Array<ModeifyResult> = (
      // $FlowFixMe ignoring silly flow error
      currentSearch && currentSearch.postProcessedResults
        ? currentSearch.postProcessedResults
        : []
    )
    const bestOptionsByMode: Array<ModeifyResult> = (
      getBestOptionsByMode(allOptions)
    )
    const optionExpandedHeight: number = (
      screenHeight - (Platform.OS === 'ios' ? 320 : 330)
    )
    const hasResults: boolean = allOptions.length > 0
    const slideIdx: number = (
      // $FlowFixMe ignoring silly flow error
      currentSearch && currentSearch.activeItinerary > -1
        ? currentSearch.activeItinerary
        : 0
    )
    const slides: Array<Element<*>> = []

    if (!currentSearch || (!currentQuery.from || !currentQuery.to)) {
      slides.push(
        <View>
          <View style={styles.summaryTitle}>
            <Text style={styles.summaryText}>
              Awaiting input
            </Text>
          </View>
          <View style={styles.summarizedModeContainer}>
            <Text>Please select a from and to location</Text>
          </View>
        </View>
      )
    } else if (currentSearch.pending) {
      slides.push(
        <View>
          <View style={styles.summaryTitle}>
            <Text style={styles.summaryText}>
              {this._getResultText()}
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
      let content: Element<*>

      if (hasResults) {
        content = (
          <View
            key='modeify-summary'
            style={styles.summaryAllOptions}
            >
            <View style={styles.summarizedModesContainer}>
              {bestOptionsByMode.map(this._renderSummarizedMode)}
            </View>
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
              {this._getResultText()}
            </Text>
          </View>
          {content}
        </View>
      )

      allOptions.forEach((option: ModeifyResult, idx: number) => {
        slides.push(this._renderOption(optionExpandedHeight, idx, option))
      })
    }

    const swiperHeight: number = (
      planViewState === 'result-expanded'
        ? screenHeight - (Platform.OS === 'ios' ? 148 : 155)
        : Platform.OS === 'ios' ? 150 : 164
    )

    const swiperDotAndButtonColor: string = (
      slideIdx === 0 ? '#fff' : 'rgba(0,0,0,.2)'
    )

    const nextButton: Element<*> = (
      <SwiperButton
        color={swiperDotAndButtonColor}
        type='next'
        />
    )

    const prevButton: Element<*> = (
      <SwiperButton
        color={swiperDotAndButtonColor}
        type='prev'
        />
    )

    return (
      <Swiper
        activeDotColor='#455a71'
        buttonWrapperStyle={planViewState !== 'result-expanded'
          ? [
            styles.swiperButtonWrapperColllapsed,
            slideIdx === 0
              ? { paddingBottom: 40 }
              : null
          ]
          : null}
        dotColor={swiperDotAndButtonColor}
        height={swiperHeight}
        index={slideIdx}
        loop={false}
        nextButton={nextButton}
        onMomentumScrollEnd={this._onSlideChange}
        prevButton={prevButton}
        ref='swiper'
        showsButtons
        >
        {slides}
      </Swiper>
    )
  }

  _renderSummarizedMode = (option: ModeifyResult): Element<*> => {
    return (
      <TouchableOpacity
        onPress={() => this._handlePressSummarized(option)}
        style={styles.summarizedModeContainer}
        >
        {['cabi', 'carshare'].indexOf(option.dominantModeIcon) > -1
          ? <ModeifyIcon
              color='#fff'
              name={option.dominantModeIcon}
              size={20}
              />
          : <MaterialIcon
              color='#fff'
              name={option.dominantModeIcon}
              size={20}
              />
        }
        <Text
          style={styles.summarizedModeTime}
          >
          {option.averageTime} mins
        </Text>
      </TouchableOpacity>
    )
  }

  render (): ?Element<*> {
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

const SwiperButton = (props: {type: 'prev' | 'next', color: string }): Element<*> => (
  <Text
    style={[styles.swiperButton, { color: props.color }]}
    >
    {props.type === 'prev' ? '‹' : '›'}
  </Text>
)

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
  stopImage: styleOptions,
  summarizedModeContainer: styleOptions,
  summarizedModesContainer: styleOptions,
  summarizedModeTime: styleOptions,
  summaryAllOptions: styleOptions,
  summaryContent: styleOptions,
  summaryLoading: styleOptions,
  summaryText: styleOptions,
  summaryTimingAndButtons: styleOptions,
  summaryTitle: styleOptions,
  swiperButton: styleOptions,
  swiperButtonWrapperColllapsed: styleOptions,
  time: styleOptions,
  timeContainer: styleOptions,
  timeMinutes: styleOptions,
  walkBikeTextOffset: styleOptions,
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
    paddingRight: 60,
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
  stopImage: {
    height: 30,
    resizeMode: 'contain',
    width: 30
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
  swiperButton: {
    fontSize: 50,
    fontFamily: 'Arial'
  },
  swiperButtonWrapperColllapsed: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: (Platform.OS === 'ios' ? 60 : 70),
    justifyContent: 'space-between',
    alignItems: 'center'
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
  walkBikeTextOffset: {
    paddingRight: 15
  },
  walkBikeTimeText: {
    color: '#748395'
  },
  walkBikeTimeContainer: {
    alignItems: 'center'
  }
}

const styles: ResultListStyle = StyleSheet.create(resultListStyle)
