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
  planResults?: ListView.DataSource;
  resultIndex?: number;
}

export default class ResultsList extends Component {
  state: State

  constructor(props: Props) {
    super(props)
  }

  state = {
    isPending: true,
    planResults: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
    resultIndex: 0
  }

  componentWillReceiveProps (nextProps: Props) {
    console.log('componentWillReceiveProps')
    console.log(nextProps)
    const {planResults} = this.state
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
      nextState.planResults = planResults.cloneWithRows(routeResult.getResults())
      nextState.resultIndex = resultIndex + 1
    }

    this.setState(nextState)
  }

  shouldComponentUpdate (nextProps: Props, nextState: State) {
    return nextState.isPending !== this.state.isPending ||
      nextState.resultIndex !== this.state.resultIndex
  }

  _onResultTitlePress = (planResult) => {

  }

  render () {
    const {fromLocation, toLocation} = this.props
    const {isPending, planResults} = this.state

    const hasResults = planResults.getRowCount() > 0

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
            dataSource={planResults}
            renderRow={(planResult) => (
              <TouchableOpacity
                onPress={() => this._onResultTitlePress(planResult)}
                >
                <Text style={styles.planResultTitle}>
                  {planResult.summary}
                </Text>
                <View>
                  <View style={styles.segments} >

                  </View>
                  <View style={styles.timeContainer} >

                  </View>
                </View>
              </TouchableOpacity>
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
  resultListContainer: {
    backgroundColor: '#5a7491',
    flex: 1,
    padding: 10
  }
})
