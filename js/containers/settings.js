// @flow

import {setMode} from 'otp-react-redux/lib/actions/form'
import {connect} from 'react-redux'

import {changePlanPostpressSetting} from '../actions/app'
import {updateSettings} from '../actions/user'
import Settings from '../components/settings'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery,
    planPostprocessSettings: state.app.planPostprocessSettings,
    user: state.user
  }
}

const mapDispatchToProps = {
  changePlanPostpressSetting,
  setMode,
  updateSettings
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
