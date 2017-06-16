// @flow

import { connect } from 'react-redux'

import OptionSelected from '../components/option-selected'

import type {ReducersState} from '../types/reducers'

const mapStateToProps = (state: ReducersState, ownProps) => {
  const {currentQuery} = state.otp
  return {
    fromLocation: currentQuery.from,
    toLocation: currentQuery.to,
    user: state.user
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(OptionSelected)
