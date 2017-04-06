// @flow

import {
  setMode,
  setDepart,
  setDate,
  setTime
} from 'otp-react-redux/lib/actions/form'
import { connect } from 'react-redux'

import {changePlanPostpressSetting} from '../actions/app'
import Settings from '../components/settings'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery,
    planPostprocessSettings: state.app.planPostprocessSettings
  }
}

const mapDispatchToProps = {
  changePlanPostpressSetting,
  setMode,
  setDepart,
  setDate,
  setTime
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
