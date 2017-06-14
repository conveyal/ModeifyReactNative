// @flow

import {logout} from '@conveyal/woonerf/src/actions/user'
import {connect} from 'react-redux'

import {deleteFavorite} from '../actions/user'
import Profile from '../components/profile'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = {
  deleteFavorite,
  logout
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
