// @flow

import {logout} from '@conveyal/woonerf/src/actions/user'
import {connect} from 'react-redux'

import DrawerContent from '../components/drawer-content'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = {
  logout
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent)
