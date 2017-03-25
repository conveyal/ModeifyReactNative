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
      nextState.options = options.cloneWithRows(routeResult.getResults())
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
        {!isPending && hasResults &&
          <ListView
            dataSource={options}
            renderRow={(option) => (
              <View style={styles.optionCard}>
                <Text style={styles.optionTitle}>
                  {option.modeDescriptor}
                </Text>
                <View>
                  <View style={styles.segments} >

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
  optionCard: {
    borderRadius: 5,
    marginVertical: 5
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
  segments: {
    backgroundColor: '#edeff0'
  },
  summary: {
    backgroundColor: '#fff',
    minHeight: 150
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
  }
})
