// @flow
import {clearLocation, setLocation, switchLocations} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import LocationForm from '../components/location-form'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  switchLocations
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationForm)
