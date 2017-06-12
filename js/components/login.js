// @flow

import isNumber from 'lodash.isnumber'
import React, {Component} from 'react'
import Auth0Lock from 'react-native-lock'

import {defaultModeSettings} from '../util'

import type {AppConfig} from '../types'
import type {ModeifyAdvancedModeSettings} from '../types/query'
import type {
  CurrentQuery,
  ModeifyModeSettings,
  PlanPostprocessSettings
} from '../types/reducers'

const config: AppConfig = require('../../config.json')

const lock = new Auth0Lock(config.auth0)

type Props = {
  changePlanPostpressSetting: ({
    setting: string,
    value: string
  }) => void,
  currentQuery: CurrentQuery,
  planPostprocessSettings: PlanPostprocessSettings,
  setAuth0User: Object => void,
  setMode: ({ mode: ModeifyModeSettings }) => void
}

export default class Login extends Component {
  props: Props

  componentDidMount() {
    const {
      changePlanPostpressSetting,
      currentQuery,
      planPostprocessSettings,
      setAuth0User,
      setMode
    } = this.props

    lock.show({
      authParams: {
        scope: "openid email offline_access",
      },
      closable: true
    }, (err, profile, token) => {
      if (err) {
        console.log(err)
        return
      }
      // Authentication worked!
      console.log('Logged in with Auth0!')
      setAuth0User({
        ...profile,
        ...token
      })

      // update mode settings if needed
      if (profile.userMetadata && profile.userMetadata.modeify_opts) {
        const {modeify_opts} = profile.userMetadata

        const settings: ModeifyAdvancedModeSettings = defaultModeSettings

        const settingKeys = [
          'bikeSpeed',
          'bikeTrafficStress',
          'maxBikeTime',
          'maxWalkTime',
          'maxCarTime',
          'walkSpeed'
        ]

        settingKeys.forEach((key: string) => {
          // check if number or non-empty string
          if (isNumber(modeify_opts[key]) || modeify_opts[key]) {
            settings[key] = modeify_opts[key]
          }
        })

        // trip plan settings
        const newMode = Object.assign(
          {},
          currentQuery.mode,
          { settings }
        )
        setMode({ mode: newMode })

        // plan postprocess settings
        const postProcessSettingKeys = [
          'carCostPerMile',
          'carParkingCost'
        ]

        postProcessSettingKeys.forEach((setting: string) => {
          if (modeify_opts[setting]) {
            changePlanPostpressSetting({
              setting,
              value: modeify_opts[setting]
            })
          }
        })
      }
    })
  }

  render () {
    return null
  }
}
