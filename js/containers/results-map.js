// @flow

import { connect } from 'react-redux'

import ResultsMap from '../components/results-map'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  const {activeSearch, currentQuery, searches} = state.otp
  return {
    activeSearch,
    fromLocation: currentQuery.from,
    searches,
    searchingOnMap: state.app.searchingOnMap,
    toLocation: currentQuery.to
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsMap)
