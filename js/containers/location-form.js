// @flow
import {clearLocation, setLocation, switchLocations} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import {focusToLocationSelection} from '../actions/app'
import LocationForm from '../components/location-form'

const mapStateToProps = (state, ownProps) => {
  return {
    appState: state.app.appState,
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  focusToLocationSelection,
  switchLocations
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationForm)
