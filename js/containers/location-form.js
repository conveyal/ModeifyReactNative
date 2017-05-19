// @flow
import {clearLocation, setLocation, switchLocations} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import LocationForm from '../components/location-form'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  switchLocations
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationForm)
