// @flow

import { connect } from 'react-redux'

import Navbar from '../components/navbar'

const mapStateToProps = (state, ownProps) => {
  return {
    appState: state.app.appState
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar)
