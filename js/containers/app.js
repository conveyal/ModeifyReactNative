// @flow
import { connect } from 'react-redux'

import App from '../components/app'

const mapStateToProps = (state, ownProps) => {
  return {
    appState: state.app.appState
  }
}

export default connect(mapStateToProps, {})(App)
