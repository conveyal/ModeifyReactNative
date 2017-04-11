// @flow
import { connect } from 'react-redux'

import App from '../components/app'

const mapStateToProps = (state, ownProps) => {
  return {
    currentQuery: state.otp.currentQuery
  }
}

export default connect(mapStateToProps, {})(App)
