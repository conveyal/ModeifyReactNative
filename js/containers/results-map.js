// @flow

import { connect } from 'react-redux'

import ResultsMap from '../components/results-map'

const mapStateToProps = (state, ownProps) => {
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
