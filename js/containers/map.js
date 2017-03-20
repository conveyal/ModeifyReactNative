// @flow

import { connect } from 'react-redux'

import Map from '../components/map'

const mapStateToProps = (state, ownProps) => {
  const {activeSearch, currentQuery, searches} = state.otp
  return {
    activeSearch,
    fromLocation: currentQuery.from,
    locationFieldHasFocus: state.app.locationFieldHasFocus,
    searches,
    toLocation: currentQuery.to
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
