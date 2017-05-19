// @flow
import { connect } from 'react-redux'

import App from '../components/app'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

export default connect(mapStateToProps, {})(App)
