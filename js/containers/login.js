// @flow

import {setAuth0User} from '@conveyal/woonerf/src/actions/user'
import {setMode} from 'otp-react-redux/lib/actions/form'
import {connect} from 'react-redux'

import {changePlanPostpressSetting} from '../actions/app'
import Login from '../components/login'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery,
    planPostprocessSettings: state.app.planPostprocessSettings
  }
}

const mapDispatchToProps = {
  changePlanPostpressSetting,
  setAuth0User,
  setMode
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
