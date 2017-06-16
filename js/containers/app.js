// @flow
import { connect } from 'react-redux'

import {loadUserData} from '../actions/user'
import App from '../components/app'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState) => {
  return {
    currentQuery: state.otp.currentQuery,
    user: state.user
  }
}

const mapDispatchToProps = {
  loadUserData
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
