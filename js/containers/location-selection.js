// @flow
import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import LocationSelection from '../components/location-selection'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const type = ownProps.type
  return {
    clearLocation: (opts) => { dispatch(clearLocation(opts)) },
    setLocation: (opts) => { dispatch(setLocation(opts)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelection)
