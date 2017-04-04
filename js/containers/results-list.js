// @flow

import { connect } from 'react-redux'

import {appStateChange} from '../actions/app'
import ResultsList from '../components/results-list'

const mapStateToProps = (state, ownProps) => {
  const {activeSearch, currentQuery, searches} = state.otp
  return {
    activeSearch,
    fromLocation: currentQuery.from,
    searches,
    toLocation: currentQuery.to
  }
}

const mapDispatchToProps = {
  appStateChange
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList)
