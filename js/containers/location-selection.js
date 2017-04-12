// @flow
import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {connect} from 'react-redux'

import {setSearchingOnMap} from '../actions/app'
import LocationSelection from '../components/location-selection'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery,
    searchingOnMap: state.app.searchingOnMap
  }
}

const mapDispatchToProps = {
  clearLocation,
  setLocation,
  setSearchingOnMap
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationSelection)
