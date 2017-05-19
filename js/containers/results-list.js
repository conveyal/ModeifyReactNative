// @flow

import { connect } from 'react-redux'

import ResultsList from '../components/results-list'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  const {activeSearch, currentQuery, searches} = state.otp
  return {
    activeSearch,
    fromLocation: currentQuery.from,
    modeSettings: currentQuery.mode.settings,
    planPostprocessSettings: state.app.planPostprocessSettings,
    searches,
    toLocation: currentQuery.to
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList)
