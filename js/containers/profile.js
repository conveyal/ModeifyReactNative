// @flow

import {logout} from '@conveyal/woonerf/src/actions/user'
import {connect} from 'react-redux'

import {deleteLocation} from '../actions/user'
import Profile from '../components/profile'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = {
  deleteLocation,
  logout
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
