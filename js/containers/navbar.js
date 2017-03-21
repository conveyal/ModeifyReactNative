// @flow

import { connect } from 'react-redux'

import {back, close} from '../actions/app'
import Navbar from '../components/navbar'

const mapStateToProps = (state, ownProps) => {
  return {
    appState: state.app.appState
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    back: (opts) => { dispatch(back(opts)) },
    close: () => { dispatch(close()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar)
