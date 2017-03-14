// @flow
import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import {blur, focus} from '../actions/location-selection'
import LocationSelection from '../components/location-selection'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const type = ownProps.type
  return {
    blurLocationSelection: () => { dispatch(blur()) },
    clearLocation: (opts) => { dispatch(clearLocation(opts)) },
    focusToLocationSelection: () => { dispatch(focus()) },
    setLocation: (opts) => { dispatch(setLocation(opts)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelection)
