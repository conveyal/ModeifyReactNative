// @flow

import fetchAction from '@conveyal/woonerf/fetch'
import {createAction} from 'redux-actions'

import type {AppConfig} from '../types/index'
import type {ServiceAlert} from '../types/reducers'

const appConfig: AppConfig = require('../../config.json')


const setServiceAlerts: Function = createAction('SET_SERVICE_ALERTS')

export function loadAlerts () {
  return fetchAction({
    next: (err: Error, res: Object): Object => {
      if (err) {
        return setServiceAlerts({
          success: false
        })
      } else {
        return setServiceAlerts({
          success: true,
          alerts: res.value
        })
      }
    },
    url: appConfig.serviceAlertsUrl
  })
}
