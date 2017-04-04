// @flow

import {
  setMode,
  setDepart,
  setDate,
  setTime
} from 'otp-react-redux/lib/actions/form'
import { connect } from 'react-redux'

import Settings from '../components/settings'

const mapStateToProps = (state, ownProps) => {
  const {currentQuery} = state.otp
  return {
    currentQuery
  }
}

const mapDispatchToProps = {
  setMode,
  setDepart,
  setDate,
  setTime
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
