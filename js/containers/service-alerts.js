// @flow
import { connect } from 'react-redux'

import {loadAlerts} from '../actions/service-alerts'
import ServiceAlerts from '../components/service-alerts'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState) => {
  return {
    serviceAlerts: state.serviceAlerts
  }
}

const mapDispatchToProps = {
  loadAlerts
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceAlerts)
