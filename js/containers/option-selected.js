// @flow

import { connect } from 'react-redux'

import OptionSelected from '../components/option-selected'

const mapStateToProps = (state, ownProps) => {
  const {currentQuery} = state.otp
  return {
    fromLocation: currentQuery.from,
    toLocation: currentQuery.to
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(OptionSelected)
