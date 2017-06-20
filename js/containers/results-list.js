// @flow

import {connect} from 'react-redux'
import {setActiveItinerary} from 'otp-react-redux/lib/actions/narrative'

import {changePlanViewState} from '../actions/app'
import ResultsList from '../components/results-list'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  const {activeSearch, currentQuery, searches} = state.otp
  return {
    currentSearch: searches.length > 0 ? searches[activeSearch] : null,
    fromLocation: currentQuery.from,
    modeSettings: currentQuery.mode.settings,
    planPostprocessSettings: state.app.planPostprocessSettings,
    planViewState: state.app.planViewState,
    toLocation: currentQuery.to
  }
}

const mapDispatchToProps = {
  changePlanViewState,
  setActiveItinerary
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList)
