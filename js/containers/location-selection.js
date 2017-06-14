// @flow
import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import {changePlanViewState, setSearchingOnMap} from '../actions/app'
import {updateFavorite} from '../actions/user'
import LocationSelection from '../components/location-selection'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery,
    planViewState: state.app.planViewState,
    searchingOnMap: state.app.searchingOnMap,
    user: state.user
  }
}

const mapDispatchToProps = {
  changePlanViewState,
  clearLocation,
  setLocation,
  setSearchingOnMap,
  updateFavorite
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelection)
