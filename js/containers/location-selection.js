// @flow
import {clearLocation, setLocation, switchLocations} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import {blurLocationField, focusToLocationSelection} from '../actions/app'
import LocationSelection from '../components/location-selection'

const mapStateToProps = (state, ownProps) => {
  return {
    appState: state.app.appState,
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  blurLocationField,
  clearLocation,
  focusToLocationSelection,
  setLocation,
  switchLocations
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelection)
