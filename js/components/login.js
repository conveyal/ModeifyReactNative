// @flow

import isNumber from 'lodash.isnumber'
import React, {Component} from 'react'
import {Platform} from 'react-native'

import lock from '../util/auth0'

import type {GetUserData, SetUser} from '../types/actions/user'
import type {
  CurrentQuery,
  ModeifyModeSettings,
  PlanPostprocessSettings
} from '../types/reducers'

type Props = {
  currentQuery: CurrentQuery,
  getUserData: GetUserData,
  onLockDismiss: () => void,
  setUser: SetUser
}

export default class Login extends Component {
  props: Props

  componentDidMount() {
    const {currentQuery, getUserData, onLockDismiss, setUser} = this.props

    lock.show({
      authParams: {
        scope: "openid email offline_access",
      },
      closable: true
    }, (err, profile, token) => {
      if (err) {
        if (err === 'Lock was dismissed by the user') {
          return onLockDismiss()
        }
        console.log(err)
        return
      }

      // Authentication worked!
      console.log('Logged in with Auth0!')

      const newUserData = {
        ...profile,
        ...token
      }

      setUser({
        currentQuery,
        newUserData,
        saveToAsyncStorage: true
      })

      // There seems to be a bug with Android lock
      // The array of modeify_places always comes back as empty
      // so if on Android, also perform a getUserData action
      if (Platform.OS === 'android') {
        getUserData({
          currentQuery,
          oldUserData: newUserData
        })
      }
    })
  }

  render () {
    return null
  }
}
