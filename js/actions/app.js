// @flow

import {clearLocation, setLocation} from 'otp-react-redux/lib/actions/map'
import {createAction} from 'redux-actions'

export const setSearchingOnMap = createAction('SEARCHING_ON_MAP')  // temp fix for https://github.com/airbnb/react-native-maps/issues/453
export const changePlanPostpressSetting = createAction('CHANGE_PLAN_POSTPROCESS_SETTING')
