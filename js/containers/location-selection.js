// @flow
import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import {blurLocationField, focusLocationField} from '../actions/app'
import LocationSelection from '../components/location-selection'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const type = ownProps.type
  return {
    blurLocationSelection: () => { dispatch(blurLocationField()) },
    clearLocation: (opts) => { dispatch(clearLocation(opts)) },
    focusToLocationSelection: () => { dispatch(focusLocationField()) },
    setLocation: (opts) => { dispatch(setLocation(opts)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelection)
