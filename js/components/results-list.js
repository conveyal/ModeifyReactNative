// @flow

import isEqual from 'lodash.isequal'
import React, { Component } from 'react'
import {
  ListView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'

import ModeifyIcon from './ModeifyIcon'
import RouteResult from '../util/route-result'

import type {Location} from '../types'

type SearchResult = {
  pending: boolean;
  planResponse: RouteResult;
}

type Props = {
  activeSearch: number;
  fromLocation: Location;
  searches: Array<SearchResult>;
  toLocation: Location;
}

type State = {
  isPending: boolean;
  options?: ListView.DataSource;
  resultIndex?: number;
  rowDetailToggle?: Object;
}

export default class ResultsList extends Component {
  routeResult: Object
  state: State

  constructor(props: Props) {
    super(props)
    this.routeResult = new RouteResult()
  }

  state = {
    isPending: true,
    options: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
    resultIndex: 0,
    rowDetailToggle: {}
  }

  componentWillMount () {

  }

  componentWillReceiveProps (nextProps: Props) {
    console.log('componentWillReceiveProps')
    const {rowDetailToggle} = this.state
    let {resultIndex} = this.state
    const {searches} = nextProps
    const currentSearch = searches[searches.length - 1]

    const nextState: State = {
      isPending: currentSearch.pending
    }

    this.routeResult.setLocation('from', nextProps.fromLocation)
    this.routeResult.setLocation('to', nextProps.toLocation)
    this.routeResult.parseResponse(currentSearch.planResponse)

    if (this.routeResult.hasChanged) {
      nextState.options = this._getRows({})
      nextState.resultIndex = resultIndex + 1
      nextState.rowDetailToggle = {}
    }

    this.routeResult.hasChanged = false

    this.setState(nextState)
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    return nextState.isPending !== this.state.isPending ||
      nextState.resultIndex !== this.state.resultIndex ||
      !isEqual(nextState.rowDetailToggle, this.state.rowDetailToggle)
  }

  _getOptionDetailListviewDatasource (option) {
    if (option.dataSource) return option.dataSource
    option.dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    option.dataSource =
      option.dataSource.cloneWithRows(
        this.routeResult.getSegmentDetailsForOption(option)
      )
    return option.dataSource
  }

  _getRows (nextRowDetailToggle) {
    const {results} = this.routeResult
    let rows = results && results.length > 0
      ? this.routeResult.results.map((result, idx) => {
          if (nextRowDetailToggle[idx]) {
            return Object.assign({}, result) // return a new object so ListView re-renders
          }
          return result
        })
      : []
    return this.state.options.cloneWithRows(rows)
  }

  // ------------------------------------------------------------------------
  // handlers
  // ------------------------------------------------------------------------

  _toggleDetails = (rowId) => {
    const nextRowDetailToggle = Object.assign({}, this.state.rowDetailToggle)
    nextRowDetailToggle[rowId] = !nextRowDetailToggle[rowId]
    this.setState({
      options: this._getRows(nextRowDetailToggle),
      rowDetailToggle: nextRowDetailToggle
    })
  }

  // ------------------------------------------------------------------------
  // renderers
  // ------------------------------------------------------------------------

  _renderOptionDetails = (optionDetail, listSectionID, listRowID) => {
    return (
      <View style={[styles.optionDetailsRow, optionDetail.rowStyle]}>
        <View style={styles.optionDetailIcon}>
          {optionDetail.routeStyle && (
            optionDetail.routeStyle.alight ||
            optionDetail.routeStyle.transfer) &&
            <View style={{
                backgroundColor: optionDetail.routeStyle.lastColor,
                height: 20,
                left: 13,
                position: 'absolute',
                top: 0,
                width: 24
              }}
              >
              <Text>&nbsp;</Text>
            </View>
          }
          {optionDetail.routeStyle && optionDetail.routeStyle.take &&
            <View style={{
                backgroundColor: optionDetail.routeStyle.color,
                bottom: 0,
                left: 13,
                position: 'absolute',
                top: 0,
                width: 24
              }}
              >
              <Text>&nbsp;</Text>
            </View>
          }
          {optionDetail.routeStyle && (
            optionDetail.routeStyle.board ||
            optionDetail.routeStyle.transfer) &&
            <View style={{
                backgroundColor: optionDetail.routeStyle.color,
                height: 30,
                left: 13,
                position: 'absolute',
                top: 17,
                width: 24
              }}
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

  _renderOption = (option, listSectionID, listRowID) => {
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
            {option.segments.map((segment, idx) =>
              <View style={styles.segmentRow}>
                <View>
                  <MaterialIcon
                    name={segment.mode}
                    size={30}
                    style={styles.modeIcon}
                    />
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
                <WalkBikeText>{option.freeflowTime} without traffic</WalkBikeText>
              }
              {option.hasTransit && option.bikeDistances &&
                <WalkBikeText>{option.bikeTim} min biking</WalkBikeText>
              }
              {option.hasTransit && option.walkDistances &&
                <WalkBikeText>{option.walkTime} min walking</WalkBikeText>
              }
              {!option.hasTransit && option.bikeDistances &&
                <WalkBikeText>{option.bikeDistances} mi biking</WalkBikeText>
              }
              {!option.hasTransit && option.walkDistances &&
                <WalkBikeText>{option.walkDistances} mi walking</WalkBikeText>
              }
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
        {rowDetailToggle[listRowID] &&
          <ListView
            dataSource={this._getOptionDetailListviewDatasource(option)}
            renderRow={this._renderOptionDetails}
          />
        }
      </View>
    )
  }

  render () {
    const {fromLocation, toLocation} = this.props
    const {isPending, options} = this.state

    const hasResults = options.getRowCount() > 0

    return (
      <ScrollView
        style={styles.resultListContainer}
        >
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
          <ListView
            dataSource={options}
            renderRow={this._renderOption}
          />
        }
      </ScrollView>
    )
  }
}

const WalkBikeText = (props) => (
  <Text
    style={styles.walkBikeTimeText}
    >
    {props.children}
  </Text>
)

const styles = StyleSheet.create({
  cost: {
    backgroundColor: '#8ec449',
    bottom: 3,
    color: '#394e1d',
    fontWeight: 'bold',
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
    fontSize: 16
  },
  modeIcon: {
    height: 27
  },
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
    flex: 1,
    padding: 10
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
  summary: {
    backgroundColor: '#fff',
    flex: 1
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
})
