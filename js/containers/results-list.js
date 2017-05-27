// @flow

import { connect } from 'react-redux'

import {changePlanViewState} from '../actions/app'
import ResultsList from '../components/results-list'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  const {activeSearch, currentQuery, searches} = state.otp
  return {
    activeSearch,
    fromLocation: currentQuery.from,
    modeSettings: currentQuery.mode.settings,
    planPostprocessSettings: state.app.planPostprocessSettings,
    planViewState: state.app.planViewState,
    searches,
    toLocation: currentQuery.to
  }
}

const mapDispatchToProps = {
  changePlanViewState
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList)
