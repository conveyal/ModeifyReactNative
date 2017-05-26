// @flow

import {
  setDepart,
  setDate,
  setTime
} from 'otp-react-redux/lib/actions/form'
import { connect } from 'react-redux'

import Timing from '../components/timing'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  setDepart,
  setDate,
  setTime
}

export default connect(mapStateToProps, mapDispatchToProps)(Timing)
