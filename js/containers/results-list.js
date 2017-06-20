// @flow

import {connect} from 'react-redux'
import {setActiveItinerary} from 'otp-react-redux/lib/actions/narrative'

import {changePlanViewState} from '../actions/app'
import ResultsList from '../components/results-list'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  const {currentQuery, searches} = state.otp
  return {
    currentQuery,
    currentSearch: (
      searches
      ? (
        searches.length > 0
          ? searches[searches.length - 1]
          : null
      )
      : null
    ),
    planViewState: state.app.planViewState
  }
}

const mapDispatchToProps = {
  changePlanViewState,
  setActiveItinerary
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList)
