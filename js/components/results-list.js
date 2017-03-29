// @flow

import React, { Component } from 'react'
import {
  ListView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import RouteResult from '../util/route-result'

const routeResult = new RouteResult()

type SearchResult = {
  pending: boolean;
  planResponse: RouteResult;
}

type Props = {
  activeSearch: number;
  searches: Array<SearchResult>;
}

type State = {
  isPending: boolean;
  options?: ListView.DataSource;
  resultIndex?: number;
}

export default class ResultsList extends Component {
  state: State

  constructor(props: Props) {
    super(props)
  }

  state = {
    isPending: true,
    options: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
    resultIndex: 0
  }

  componentWillReceiveProps (nextProps: Props) {
    const {options} = this.state
    let {resultIndex} = this.state
    const {searches} = nextProps
    const currentSearch = searches[searches.length - 1]

    const nextState: State = {
      isPending: currentSearch.pending
    }

    let resultChanged = false

    resultChanged = resultChanged ||
      routeResult.parseResponse(currentSearch.planResponse)

    if (resultChanged) {
      nextState.options = options.cloneWithRows(routeResult.results)
      nextState.resultIndex = resultIndex + 1
    }

    this.setState(nextState)
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    return nextState.isPending !== this.state.isPending ||
      nextState.resultIndex !== this.state.resultIndex
  }

  _onResultTitlePress = (option) => {

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
        {routeResult.hasError &&
          <Text style={styles.infoText}>An error occurred.  Please try again!</Text>
        }
        {!isPending && hasResults &&
          <ListView
            dataSource={options}
            renderRow={(option) => (
              <View style={styles.optionCard}>
                <Text style={styles.optionTitle}>
                  {option.modeDescriptor}
                </Text>
                <View style={styles.optionContent}>
                  <View style={styles.segments} >
                    {option.segments.map((segment, idx) =>
                      <View style={styles.segmentRow}>
                        <View>
                          <Icon
                            name={segment.mode}
                            size={30}
                            style={styles.modeIcon}
                            />
                          {idx < option.segments.length - 1 &&
                            <Icon
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
                  </View>
                </View>
              </View>
            )}
          />
        }
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
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
    flexDirection: 'row'
  },
  optionTitle: {
    backgroundColor: '#455a71',
    color: '#fff',
    fontSize: 14,
    padding: 5
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
  }
})
