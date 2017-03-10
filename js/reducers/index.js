// @flow
import {handleActions} from 'redux-actions'

import * as user from './user'

export default {
  user: handleActions(user.reducers, user.initialState)
}
