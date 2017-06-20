// @flow

import {createAction} from 'redux-actions'

export const setSearchingOnMap = createAction('SEARCHING_ON_MAP')  // temp fix for https://github.com/airbnb/react-native-maps/issues/453
export const changePlanViewState = createAction('CHANGE_PLAN_VIEW_STATE')
