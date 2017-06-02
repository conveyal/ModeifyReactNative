// @flow

import {setAuth0User} from '@conveyal/woonerf/src/actions/user'
import {connect} from 'react-redux'

import Login from '../components/login'

const mapStateToProps = () => ({})

const mapDispatchToProps = { setAuth0User }

export default connect(mapStateToProps, mapDispatchToProps)(Login)
