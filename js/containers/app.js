// @flow
import { connect } from 'react-redux'

import App from '../components/app'

const mapStateToProps = (state, ownProps) => {
  return {
    appState: state.app.appState
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(App)