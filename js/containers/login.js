// @flow

import { connect } from 'react-redux'

import {setAuth0User} from '../actions/user'
import Login from '../components/login'

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = { setAuth0User }

export default connect(mapStateToProps, mapDispatchToProps)(Login)
