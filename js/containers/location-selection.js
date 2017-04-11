// @flow
import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import LocationSelection from '../components/location-selection'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  clearLocation,
  setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelection)
