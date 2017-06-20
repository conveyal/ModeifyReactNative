// @flow

import {connect} from 'react-redux'

import {getUserData, setUser} from '../actions/user'
import Login from '../components/login'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery,
    planPostprocessSettings: state.app.planPostprocessSettings
  }
}

const mapDispatchToProps = {
  getUserData,
  setUser
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
