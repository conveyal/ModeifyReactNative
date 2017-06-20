// @flow

import type {CurrentQuery} from '../query'
import type {UserReducerState} from '../reducers'

export type GetUserData = ({
  currentQuery: CurrentQuery,
  oldUserData: UserReducerState
}) => Object

export type LoadUserData = (currentQuery: CurrentQuery) => Object

export type SetUser = ({
  currentQuery: CurrentQuery,
  newUserData: UserReducerState
}) => Object
