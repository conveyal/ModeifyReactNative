// @flow
import {clearLocation, setLocation, switchLocations} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import {changePlanViewState} from '../actions/app'
import LocationAndSettings from '../components/location-and-settings'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery,
    planViewState: state.app.planViewState
  }
}

const mapDispatchToProps = {
  changePlanViewState,
  switchLocations
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationAndSettings)
